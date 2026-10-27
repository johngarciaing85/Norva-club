import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.modules.catalog.models import (
    Category,
    Gender,
    Product,
    ProductImage,
    ProductStatus,
    ProductVariant,
    Size,
)


def _product_eager_opts():
    return [
        selectinload(Product.images),
        selectinload(Product.variants).selectinload(ProductVariant.size),
        selectinload(Product.category),
    ]


# ── Public ──────────────────────────────────────────────────────


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
        base.options(*_product_eager_opts())
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
        .options(*_product_eager_opts())
    )
    return session.scalar(stmt)


# ── Admin ───────────────────────────────────────────────────────


def list_all_products(
    session: Session,
    search: str | None = None,
    status: str | None = None,
) -> list[Product]:
    stmt = select(Product).options(*_product_eager_opts())

    if status and status != "todos":
        stmt = stmt.where(Product.status == ProductStatus(status))

    if search:
        escaped = search.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        stmt = stmt.where(Product.name.ilike(f"%{escaped}%"))

    stmt = stmt.order_by(Product.created_at.desc())
    return list(session.scalars(stmt))


def get_product_by_id(session: Session, product_id: uuid.UUID) -> Product | None:
    stmt = (
        select(Product)
        .where(Product.id == product_id)
        .options(*_product_eager_opts())
    )
    return session.scalar(stmt)


def create_product(session: Session, data: dict) -> Product:
    product = Product(
        name=data["name"],
        slug=data["slug"],
        description=data["description"],
        price_cop=data["price"],
        category_id=uuid.UUID(data["categoryId"]),
        status=ProductStatus(data.get("status", "borrador")),
        availability=data.get("availability", "inmediata"),
        gender=Gender(data.get("gender", "unisex")),
        size_guide=data.get("sizeGuide"),
        inventory_updated_at=datetime.now(UTC),
    )
    session.add(product)
    session.flush()

    _sync_variants(session, product, data.get("variants", []))
    _sync_images(session, product, data.get("images", []))

    return product


def update_product(session: Session, product: Product, data: dict) -> Product:
    for field in ("name", "slug", "description"):
        if field in data:
            setattr(product, field, data[field])

    if "price" in data:
        product.price_cop = data["price"]
    if "categoryId" in data:
        product.category_id = uuid.UUID(data["categoryId"])
    if "status" in data:
        product.status = ProductStatus(data["status"])
    if "availability" in data:
        product.availability = data["availability"]
    if "gender" in data:
        product.gender = Gender(data["gender"])
    if "sizeGuide" in data:
        product.size_guide = data["sizeGuide"]

    product.inventory_updated_at = datetime.now(UTC)
    session.flush()

    if "variants" in data:
        _sync_variants(session, product, data["variants"])
    if "images" in data:
        _sync_images(session, product, data["images"])

    return product


def archive_product(session: Session, product: Product) -> None:
    product.status = ProductStatus.archivado
    session.flush()


# ── Admin Categories ───────────────────────────────────────────


def get_category_by_id(session: Session, category_id: uuid.UUID) -> Category | None:
    return session.get(Category, category_id)


def create_category(session: Session, data: dict) -> Category:
    max_order = session.scalar(select(func.max(Category.sort_order))) or 0
    cat = Category(
        name=data["name"],
        slug=data["slug"],
        description=data.get("description", ""),
        size_type=data["sizeType"],
        sort_order=max_order + 1,
    )
    session.add(cat)
    session.flush()
    return cat


def update_category(session: Session, cat: Category, data: dict) -> Category:
    for field in ("name", "slug", "description"):
        if field in data:
            setattr(cat, field, data[field])
    if "sizeType" in data:
        cat.size_type = data["sizeType"]
    session.flush()
    return cat


def delete_category(session: Session, cat: Category) -> None:
    cat.is_active = False
    session.flush()


# ── Admin Sizes ────────────────────────────────────────────────


def list_sizes(session: Session, size_group: str | None = None) -> list[Size]:
    stmt = select(Size).order_by(Size.size_group, Size.sort_order)
    if size_group:
        stmt = stmt.where(Size.size_group == size_group)
    return list(session.scalars(stmt))


def create_size(session: Session, label: str, size_group: str) -> Size:
    max_order = session.scalar(
        select(func.max(Size.sort_order)).where(Size.size_group == size_group)
    ) or 0
    size = Size(label=label, size_group=size_group, sort_order=max_order + 1)
    session.add(size)
    session.flush()
    return size


def delete_size(session: Session, size: Size) -> None:
    session.delete(size)
    session.flush()


def _sync_variants(session: Session, product: Product, variants_data: list[dict]) -> None:
    existing = {v.size.label: v for v in product.variants}
    size_group = product.category.size_type

    for vd in variants_data:
        size_label = vd["size"]
        stock = vd.get("stock", 0)

        if size_label in existing:
            existing[size_label].stock = stock
            del existing[size_label]
        else:
            size = session.scalar(
                select(Size).where(Size.label == size_label, Size.size_group == size_group)
            )
            if size:
                session.add(ProductVariant(
                    product_id=product.id,
                    size_id=size.id,
                    stock=stock,
                ))

    for leftover in existing.values():
        session.delete(leftover)

    session.flush()


def _sync_images(session: Session, product: Product, images_data: list[dict]) -> None:
    existing_ids = {str(img.id) for img in product.images}
    incoming_ids = {img["id"] for img in images_data if img.get("id")}

    for img in product.images:
        if str(img.id) not in incoming_ids:
            session.delete(img)

    for i, img_data in enumerate(images_data):
        if img_data.get("id") and img_data["id"] in existing_ids:
            existing_img = next(
                (im for im in product.images if str(im.id) == img_data["id"]), None
            )
            if existing_img:
                existing_img.sort_order = i
                if "alt" in img_data:
                    existing_img.alt = img_data["alt"]
        else:
            session.add(ProductImage(
                product_id=product.id,
                url=img_data["url"],
                cloudinary_public_id=img_data.get("publicId"),
                alt=img_data.get("alt", ""),
                sort_order=i,
            ))

    session.flush()
