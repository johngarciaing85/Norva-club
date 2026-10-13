import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Text,
    Uuid,
    func,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MovementReason(str, enum.Enum):
    venta = "venta"
    ajuste = "ajuste"
    reposicion = "reposicion"
    cancelacion = "cancelacion"


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    variant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("product_variants.id", ondelete="RESTRICT")
    )
    delta: Mapped[int] = mapped_column(Integer)
    reason: Mapped[MovementReason] = mapped_column(
        SAEnum(MovementReason, name="movement_reason_type")
    )
    note: Mapped[str | None] = mapped_column(Text)
    admin_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("admin_users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    variant: Mapped["ProductVariant"] = relationship()  # noqa: F821
