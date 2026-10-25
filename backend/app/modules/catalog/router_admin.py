"""Admin catalog endpoints: create, update, delete products."""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.core.errors import NotFoundError
from app.modules.auth.models import AdminUser
from app.modules.catalog import service
from app.modules.catalog.models import Product, Size
from app.modules.catalog.schemas import (
    AdminProductListOut,
    AdminProductOut,
    CategoryCreateIn,
    CategoryOut,
    CategoryUpdateIn,
    ProductCreateIn,
    ProductUpdateIn,
    SizeCreateIn,
    SizeOut,
)

router = APIRouter(prefix="/admin", tags=["admin-catalog"], dependencies=[Depends(get_current_admin)])


def _admin_product_to_dict(p: Product) -> dict:
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
            {
                "id": str(img.id),
                "url": img.url,
                "alt": img.alt,
                "publicId": img.cloudinary_public_id,
            }
            for img in p.images
        ],
        "availability": p.availability.value,
        "status": p.status.value,
        "sizeGuide": p.size_guide,
        "inventoryUpdatedAt": (
            p.inventory_updated_at.isoformat() if p.inventory_updated_at else None
        ),
        "createdAt": p.created_at.isoformat() if p.created_at else None,
    }


@router.get("/products", response_model=AdminProductListOut)
def list_products(
    search: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
):
    products = service.list_all_products(db, search=search, status=status)
    return {"products": [_admin_product_to_dict(p) for p in products]}


@router.get("/products/{product_id}", response_model=AdminProductOut)
def get_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = service.get_product_by_id(db, product_id)
    if product is None:
        raise NotFoundError("Producto", str(product_id))
    return _admin_product_to_dict(product)


@router.post("/products", response_model=AdminProductOut, status_code=201)
def create_product(
    body: ProductCreateIn,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    product = service.create_product(db, body.model_dump())
    db.commit()
    db.refresh(product)
    return _admin_product_to_dict(product)


@router.put("/products/{product_id}", response_model=AdminProductOut)
def update_product(
    product_id: uuid.UUID,
    body: ProductUpdateIn,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    product = service.get_product_by_id(db, product_id)
    if product is None:
        raise NotFoundError("Producto", str(product_id))
    data = body.model_dump(exclude_none=True)
    service.update_product(db, product, data)
    db.commit()
    db.refresh(product)
    return _admin_product_to_dict(product)


@router.delete("/products/{product_id}")
def archive_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    product = service.get_product_by_id(db, product_id)
    if product is None:
        raise NotFoundError("Producto", str(product_id))
    service.archive_product(db, product)
    db.commit()
    return {"ok": True}


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


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(
    body: CategoryCreateIn,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    cat = service.create_category(db, body.model_dump())
    db.commit()
    db.refresh(cat)
    return {
        "id": str(cat.id),
        "slug": cat.slug,
        "name": cat.name,
        "description": cat.description,
        "sizeType": cat.size_type.value,
    }


@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: uuid.UUID,
    body: CategoryUpdateIn,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    cat = service.get_category_by_id(db, category_id)
    if cat is None:
        raise NotFoundError("Categoría", str(category_id))
    data = body.model_dump(exclude_none=True)
    service.update_category(db, cat, data)
    db.commit()
    db.refresh(cat)
    return {
        "id": str(cat.id),
        "slug": cat.slug,
        "name": cat.name,
        "description": cat.description,
        "sizeType": cat.size_type.value,
    }


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    cat = service.get_category_by_id(db, category_id)
    if cat is None:
        raise NotFoundError("Categoría", str(category_id))
    service.delete_category(db, cat)
    db.commit()
    return {"ok": True}


# ── Sizes ──────────────────────────────────────────────────────


@router.get("/sizes", response_model=list[SizeOut])
def list_sizes(
    size_group: str | None = Query(None),
    db: Session = Depends(get_db),
):
    sizes = service.list_sizes(db, size_group=size_group)
    return [
        {
            "id": str(s.id),
            "label": s.label,
            "sizeGroup": s.size_group.value,
            "sortOrder": s.sort_order,
        }
        for s in sizes
    ]


@router.post("/sizes", response_model=SizeOut, status_code=201)
def create_size(
    body: SizeCreateIn,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    size = service.create_size(db, body.label, body.sizeGroup)
    db.commit()
    db.refresh(size)
    return {
        "id": str(size.id),
        "label": size.label,
        "sizeGroup": size.size_group.value,
        "sortOrder": size.sort_order,
    }


@router.delete("/sizes/{size_id}")
def delete_size(
    size_id: uuid.UUID,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    size = db.get(Size, size_id)
    if size is None:
        raise NotFoundError("Talla", str(size_id))
    service.delete_size(db, size)
    db.commit()
    return {"ok": True}
