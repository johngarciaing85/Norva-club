from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.modules.catalog.models import (
    Category,
    Product,
    ProductStatus,
    ProductVariant,
)


def list_active_categories(session: Session) -> list[Category]:
    stmt = (
        select(Category)
        .where(Category.is_active.is_(True))
        .order_by(Category.sort_order)
    )
    return list(session.scalars(stmt))


def list_published_products(
    session: Session,
    category_slug: str | None = None,
    page: int = 1,
    page_size: int = 12,
) -> tuple[list[Product], int]:
    page_size = min(page_size, 50)

    base = select(Product).where(Product.status == ProductStatus.publicado)
    count_base = select(func.count()).select_from(Product).where(
        Product.status == ProductStatus.publicado
    )

    if category_slug:
        base = base.join(Category).where(Category.slug == category_slug)
        count_base = count_base.join(Category).where(Category.slug == category_slug)

    total = session.scalar(count_base) or 0

    stmt = (
        base.options(
            selectinload(Product.images),
            selectinload(Product.variants).selectinload(ProductVariant.size),
            selectinload(Product.category),
        )
        .order_by(Product.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    products = list(session.scalars(stmt))
    return products, total


def get_product_by_slug(session: Session, slug: str) -> Product | None:
    stmt = (
        select(Product)
        .where(Product.slug == slug, Product.status == ProductStatus.publicado)
        .options(
            selectinload(Product.images),
            selectinload(Product.variants).selectinload(ProductVariant.size),
            selectinload(Product.category),
        )
    )
    return session.scalar(stmt)
