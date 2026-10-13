import uuid
from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy import update
from sqlalchemy.orm import Session

from app.core.errors import InsufficientStockError
from app.modules.catalog.models import Product, ProductVariant
from app.modules.inventory.models import InventoryMovement, MovementReason


def adjust_stock(
    session: Session,
    variant_id: uuid.UUID,
    delta: int,
    reason: MovementReason,
    note: str | None = None,
    admin_user_id: uuid.UUID | None = None,
) -> InventoryMovement:
    result = session.execute(
        update(ProductVariant)
        .where(ProductVariant.id == variant_id)
        .where(ProductVariant.stock + delta >= 0)
        .values(stock=ProductVariant.stock + delta)
        .returning(ProductVariant.product_id)
    )
    row = result.first()
    if row is None:
        raise InsufficientStockError(variant_id, delta)

    movement = InventoryMovement(
        variant_id=variant_id,
        delta=delta,
        reason=reason,
        note=note,
        admin_user_id=admin_user_id,
    )
    session.add(movement)

    session.execute(
        update(Product)
        .where(Product.id == row.product_id)
        .values(inventory_updated_at=datetime.now(UTC))
    )

    session.flush()
    return movement


@dataclass
class StockChange:
    variant_id: uuid.UUID
    new_stock: int


def set_stock_bulk(
    session: Session,
    changes: list[StockChange],
    admin_user_id: uuid.UUID | None = None,
) -> list[InventoryMovement]:
    movements: list[InventoryMovement] = []
    product_ids: set[uuid.UUID] = set()

    for change in changes:
        variant = session.get(
            ProductVariant, change.variant_id, with_for_update=True,
        )
        if variant is None:
            raise ValueError(f"Variante {change.variant_id} no encontrada")

        if change.new_stock < 0:
            raise InsufficientStockError(change.variant_id, change.new_stock - variant.stock)

        delta = change.new_stock - variant.stock
        if delta == 0:
            continue

        variant.stock = change.new_stock
        movement = InventoryMovement(
            variant_id=change.variant_id,
            delta=delta,
            reason=MovementReason.ajuste,
            admin_user_id=admin_user_id,
        )
        session.add(movement)
        movements.append(movement)
        product_ids.add(variant.product_id)

    now = datetime.now(UTC)
    for pid in product_ids:
        session.execute(
            update(Product).where(Product.id == pid).values(inventory_updated_at=now)
        )

    session.flush()
    return movements
