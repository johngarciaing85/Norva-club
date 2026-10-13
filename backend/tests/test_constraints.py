import uuid

import pytest
from sqlalchemy.exc import IntegrityError

from app.modules.catalog.models import (
    Availability,
    Category,
    Product,
    ProductStatus,
    ProductVariant,
    Size,
    SizeGroup,
)


def _make_category(db, **kw):
    defaults = {
        "name": "Test Cat",
        "slug": f"test-cat-{uuid.uuid4().hex[:8]}",
        "description": "test",
        "size_type": SizeGroup.ropa,
    }
    defaults.update(kw)
    cat = Category(**defaults)
    db.add(cat)
    db.flush()
    return cat


def _make_size(db, label="M", group=SizeGroup.ropa):
    s = Size(label=label, size_group=group, sort_order=0)
    db.add(s)
    db.flush()
    return s


def _make_product(db, category, **kw):
    defaults = {
        "name": "Test Prod",
        "slug": f"test-prod-{uuid.uuid4().hex[:8]}",
        "description": "test",
        "price_cop": 50000,
        "category_id": category.id,
        "status": ProductStatus.publicado,
        "availability": Availability.inmediata,
    }
    defaults.update(kw)
    prod = Product(**defaults)
    db.add(prod)
    db.flush()
    return prod


def test_negative_stock_rejected(db):
    cat = _make_category(db)
    size = _make_size(db)
    prod = _make_product(db, cat)
    variant = ProductVariant(product_id=prod.id, size_id=size.id, stock=-1)
    db.add(variant)
    with pytest.raises(IntegrityError):
        db.flush()


def test_zero_price_rejected(db):
    cat = _make_category(db)
    with pytest.raises(IntegrityError):
        _make_product(db, cat, price_cop=0)


def test_negative_price_rejected(db):
    cat = _make_category(db)
    with pytest.raises(IntegrityError):
        _make_product(db, cat, price_cop=-100)


def test_duplicate_slug_rejected(db):
    cat = _make_category(db)
    slug = f"unique-slug-{uuid.uuid4().hex[:8]}"
    _make_product(db, cat, slug=slug)
    with pytest.raises(IntegrityError):
        _make_product(db, cat, slug=slug)


def test_valid_stock_accepted(db):
    cat = _make_category(db)
    size = _make_size(db, label="L")
    prod = _make_product(db, cat)
    variant = ProductVariant(product_id=prod.id, size_id=size.id, stock=0)
    db.add(variant)
    db.flush()
    assert variant.stock == 0
