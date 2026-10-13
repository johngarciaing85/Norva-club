import uuid

import pytest

from app.core.errors import InsufficientStockError
from app.modules.catalog.models import (
    Availability,
    Category,
    Product,
    ProductStatus,
    ProductVariant,
    Size,
    SizeGroup,
)
from app.modules.inventory.models import MovementReason
from app.modules.inventory.service import StockChange, adjust_stock, set_stock_bulk


def _setup(db, stock=5):
    cat = Category(
        name="Cat", slug=f"cat-{uuid.uuid4().hex[:8]}", description="",
        size_type=SizeGroup.ropa,
    )
    db.add(cat)
    db.flush()

    size = Size(label="M", size_group=SizeGroup.ropa, sort_order=0)
    db.add(size)
    db.flush()

    prod = Product(
        name="Prod", slug=f"prod-{uuid.uuid4().hex[:8]}", description="",
        price_cop=50000, category_id=cat.id, status=ProductStatus.publicado,
        availability=Availability.inmediata,
    )
    db.add(prod)
    db.flush()

    variant = ProductVariant(product_id=prod.id, size_id=size.id, stock=stock)
    db.add(variant)
    db.flush()

    return prod, variant


class TestAdjustStock:
    def test_normal_decrement(self, db):
        _prod, variant = _setup(db, stock=5)
        movement = adjust_stock(db, variant.id, -3, MovementReason.venta)
        db.refresh(variant)
        assert variant.stock == 2
        assert movement.delta == -3
        assert movement.reason == MovementReason.venta

    def test_negative_stock_fails(self, db):
        _prod, variant = _setup(db, stock=2)
        with pytest.raises(InsufficientStockError):
            adjust_stock(db, variant.id, -5, MovementReason.venta)

    def test_no_movement_on_failure(self, db):
        from app.modules.inventory.models import InventoryMovement

        _prod, variant = _setup(db, stock=1)
        try:
            adjust_stock(db, variant.id, -3, MovementReason.venta)
        except InsufficientStockError:
            pass
        movements = db.query(InventoryMovement).filter_by(variant_id=variant.id).all()
        assert len(movements) == 0

    def test_increment(self, db):
        _prod, variant = _setup(db, stock=3)
        movement = adjust_stock(db, variant.id, 5, MovementReason.reposicion)
        db.refresh(variant)
        assert variant.stock == 8
        assert movement.delta == 5

    def test_updates_inventory_timestamp(self, db):
        prod, variant = _setup(db, stock=5)
        assert prod.inventory_updated_at is None
        adjust_stock(db, variant.id, -1, MovementReason.venta)
        db.refresh(prod)
        assert prod.inventory_updated_at is not None


class TestSetStockBulk:
    def test_bulk_update(self, db):
        _prod, variant = _setup(db, stock=5)
        changes = [StockChange(variant_id=variant.id, new_stock=10)]
        movements = set_stock_bulk(db, changes)
        db.refresh(variant)
        assert variant.stock == 10
        assert len(movements) == 1
        assert movements[0].delta == 5

    def test_all_or_nothing(self, db):
        prod, variant = _setup(db, stock=5)

        size2 = Size(label="L", size_group=SizeGroup.ropa, sort_order=1)
        db.add(size2)
        db.flush()
        variant2 = ProductVariant(product_id=prod.id, size_id=size2.id, stock=3)
        db.add(variant2)
        db.flush()

        changes = [
            StockChange(variant_id=variant.id, new_stock=8),
            StockChange(variant_id=variant2.id, new_stock=-1),
        ]
        with pytest.raises(InsufficientStockError):
            set_stock_bulk(db, changes)

    def test_updates_inventory_timestamp(self, db):
        prod, variant = _setup(db, stock=5)
        assert prod.inventory_updated_at is None
        set_stock_bulk(db, [StockChange(variant_id=variant.id, new_stock=3)])
        db.refresh(prod)
        assert prod.inventory_updated_at is not None

    def test_skip_zero_delta(self, db):
        _prod, variant = _setup(db, stock=5)
        movements = set_stock_bulk(db, [StockChange(variant_id=variant.id, new_stock=5)])
        assert len(movements) == 0
