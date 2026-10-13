from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import NotFoundError
from app.modules.catalog import service
from app.modules.catalog.models import Product
from app.modules.catalog.schemas import CategoryOut, ProductListOut, ProductOut

router = APIRouter(tags=["catalog"])


def _product_to_dict(p: Product) -> dict:
    return {
        "id": str(p.id),
        "slug": p.slug,
        "name": p.name,
        "description": p.description,
        "price": p.price_cop,
        "categoryId": str(p.category_id),
        "categorySlug": p.category.slug,
        "sizeType": p.category.size_type.value,
        "variants": [
            {"size": v.size.label, "stock": v.stock}
            for v in sorted(p.variants, key=lambda v: v.size.sort_order)
        ],
        "images": [
            {"id": str(img.id), "url": img.url, "alt": img.alt}
            for img in p.images
        ],
        "availability": p.availability.value,
        "updatedAt": (
            p.inventory_updated_at.date().isoformat()
            if p.inventory_updated_at
            else None
        ),
    }


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    categories = service.list_active_categories(db)
    return [
        {
            "id": str(c.id),
            "slug": c.slug,
            "name": c.name,
            "description": c.description,
            "sizeType": c.size_type.value,
        }
        for c in categories
    ]


@router.get("/products", response_model=ProductListOut)
def list_products(
    category: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    products, total = service.list_published_products(
        db, category_slug=category, page=page, page_size=page_size
    )
    return {
        "products": [_product_to_dict(p) for p in products],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/products/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = service.get_product_by_slug(db, slug)
    if product is None:
        raise NotFoundError("Producto", slug)
    return _product_to_dict(product)
