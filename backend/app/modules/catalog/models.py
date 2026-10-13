import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SizeGroup(str, enum.Enum):
    ropa = "ropa"
    calzado = "calzado"
    unica = "unica"


class ProductStatus(str, enum.Enum):
    borrador = "borrador"
    publicado = "publicado"
    archivado = "archivado"


class Availability(str, enum.Enum):
    inmediata = "inmediata"
    bajo_confirmacion = "bajo_confirmacion"


_size_group_type = SAEnum(SizeGroup, name="size_group_type")
_product_status_type = SAEnum(ProductStatus, name="product_status_type")
_availability_type = SAEnum(Availability, name="availability_type")


class Size(Base):
    __tablename__ = "sizes"
    __table_args__ = (
        UniqueConstraint("label", "size_group", name="uq_sizes_label_group"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    label: Mapped[str] = mapped_column(String(20))
    size_group: Mapped[SizeGroup] = mapped_column(_size_group_type)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100))
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    size_type: Mapped[SizeGroup] = mapped_column(_size_group_type)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price_cop > 0", name="ck_products_price_positive"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), index=True
    )
    name: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    price_cop: Mapped[int] = mapped_column(BigInteger)
    status: Mapped[ProductStatus] = mapped_column(
        _product_status_type, default=ProductStatus.borrador, index=True
    )
    availability: Mapped[Availability] = mapped_column(
        _availability_type, default=Availability.inmediata
    )
    inventory_updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    category: Mapped["Category"] = relationship(back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship(
        back_populates="product", order_by="ProductImage.sort_order"
    )
    variants: Mapped[list["ProductVariant"]] = relationship(back_populates="product")


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), index=True
    )
    url: Mapped[str] = mapped_column(Text)
    cloudinary_public_id: Mapped[str | None] = mapped_column(String(200))
    alt: Mapped[str] = mapped_column(String(300), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    product: Mapped["Product"] = relationship(back_populates="images")


class ProductVariant(Base):
    __tablename__ = "product_variants"
    __table_args__ = (
        UniqueConstraint("product_id", "size_id", name="uq_product_variants_product_size"),
        CheckConstraint("stock >= 0", name="ck_product_variants_stock_nonneg"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), index=True
    )
    size_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sizes.id", ondelete="RESTRICT"))
    stock: Mapped[int] = mapped_column(Integer, default=0)

    product: Mapped["Product"] = relationship(back_populates="variants")
    size: Mapped["Size"] = relationship()
