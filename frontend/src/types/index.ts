export type SizeType = "ropa" | "calzado" | "unica";
export type Availability = "inmediata" | "bajo_confirmacion";

export interface SizeVariant {
  size: string;
  stock: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categorySlug: string;
  sizeType: SizeType;
  variants: SizeVariant[];
  images: ProductImage[];
  availability: Availability;
  inventoryUpdatedAt: string | null;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  sizeType: SizeType;
}

export type ProductStatus = "borrador" | "publicado" | "archivado";

export interface AdminProduct extends Product {
  status: ProductStatus;
}

export type SalesDocStatus = "borrador" | "enviado" | "fallo";

export interface SalesDocLine {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface SalesDoc {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  date: string;
  lines: SalesDocLine[];
  total: number;
  status: SalesDocStatus;
}
