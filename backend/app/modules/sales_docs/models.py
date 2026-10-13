import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SalesDocStatus(str, enum.Enum):
    borrador = "borrador"
    enviando = "enviando"
    enviado = "enviado"
    fallo = "fallo"


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(254))
    name: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class SalesDocument(Base):
    __tablename__ = "sales_documents"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    number: Mapped[str] = mapped_column(String(20), unique=True)
    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("customers.id", ondelete="SET NULL")
    )
    customer_email: Mapped[str] = mapped_column(String(254))
    customer_name: Mapped[str] = mapped_column(String(200))
    issue_date: Mapped[date] = mapped_column(Date)
    total_cop: Mapped[int] = mapped_column(BigInteger)
    status: Mapped[SalesDocStatus] = mapped_column(
        SAEnum(SalesDocStatus, name="sales_doc_status_type"),
        default=SalesDocStatus.borrador,
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("admin_users.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    customer: Mapped["Customer | None"] = relationship()
    items: Mapped[list["SalesDocumentItem"]] = relationship(back_populates="document")
    dispatches: Mapped[list["EmailDispatch"]] = relationship(back_populates="document")


class SalesDocumentItem(Base):
    __tablename__ = "sales_document_items"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_sales_doc_items_qty_positive"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sales_documents.id", ondelete="CASCADE")
    )
    variant_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("product_variants.id", ondelete="SET NULL")
    )
    description: Mapped[str] = mapped_column(String(300))
    size_label: Mapped[str] = mapped_column(String(20))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price_cop: Mapped[int] = mapped_column(BigInteger)
    line_total_cop: Mapped[int] = mapped_column(BigInteger)

    document: Mapped["SalesDocument"] = relationship(back_populates="items")


class EmailDispatch(Base):
    __tablename__ = "email_dispatches"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sales_documents.id", ondelete="CASCADE")
    )
    attempt_no: Mapped[int] = mapped_column(Integer)
    provider: Mapped[str | None] = mapped_column(String(50))
    provider_message_id: Mapped[str | None] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(50))
    error: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    document: Mapped["SalesDocument"] = relationship(back_populates="dispatches")
