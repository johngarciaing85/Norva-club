from pydantic import BaseModel


class VariantOut(BaseModel):
    size: str
    stock: int


class ImageOut(BaseModel):
    id: str
    url: str
    alt: str


class ProductSummaryOut(BaseModel):
    id: str
    slug: str
    name: str
    description: str
    price: int
    categoryId: str
    categorySlug: str
    sizeType: str
    variants: list[VariantOut]
    images: list[ImageOut]
    availability: str
    inventoryUpdatedAt: str | None = None


class ProductOut(ProductSummaryOut):
    sizeGuide: str | None = None


class ProductListOut(BaseModel):
    products: list[ProductSummaryOut]
    total: int
    page: int
    page_size: int


class CategoryOut(BaseModel):
    id: str
    slug: str
    name: str
    description: str
    sizeType: str
