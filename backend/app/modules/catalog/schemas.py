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


# ── Admin schemas ───────────────────────────────────────────────


class AdminImageOut(BaseModel):
    id: str
    url: str
    alt: str
    publicId: str | None = None


class AdminProductOut(BaseModel):
    id: str
    slug: str
    name: str
    description: str
    price: int
    categoryId: str
    categorySlug: str
    sizeType: str
    variants: list[VariantOut]
    images: list[AdminImageOut]
    availability: str
    status: str
    sizeGuide: str | None = None
    inventoryUpdatedAt: str | None = None
    createdAt: str | None = None


class AdminProductListOut(BaseModel):
    products: list[AdminProductOut]


class ProductCreateIn(BaseModel):
    name: str
    slug: str
    description: str = ""
    price: int
    categoryId: str
    status: str = "borrador"
    availability: str = "inmediata"
    sizeGuide: str | None = None
    variants: list[dict] = []
    images: list[dict] = []


class ProductUpdateIn(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    price: int | None = None
    categoryId: str | None = None
    status: str | None = None
    availability: str | None = None
    sizeGuide: str | None = None
    variants: list[dict] | None = None
    images: list[dict] | None = None
