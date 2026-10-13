import type { Category, Product } from "@/types";

function placeholder(color: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect fill="${color}" width="400" height="500"/><text x="200" y="250" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="sans-serif" font-size="18">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const categories: Category[] = [
  {
    id: "cat-1",
    slug: "camisetas",
    name: "Camisetas",
    description: "Camisetas oversize y streetwear",
    sizeType: "ropa",
  },
  {
    id: "cat-2",
    slug: "pantalones",
    name: "Pantalones",
    description: "Pantalones cargo y joggers",
    sizeType: "ropa",
  },
  {
    id: "cat-3",
    slug: "accesorios",
    name: "Accesorios",
    description: "Gorras, relojes y complementos",
    sizeType: "unica",
  },
];

export const products: Product[] = [
  {
    id: "prod-1",
    slug: "camiseta-oversize-norva",
    name: "Camiseta Oversize NÓRVA",
    description:
      "Camiseta oversize de algodón pesado con estampado frontal. Corte relajado y caída premium.",
    price: 89900,
    categoryId: "cat-1",
    categorySlug: "camisetas",
    sizeType: "ropa",
    variants: [
      { size: "XS", stock: 3 },
      { size: "S", stock: 5 },
      { size: "M", stock: 0 },
      { size: "L", stock: 8 },
      { size: "XL", stock: 2 },
      { size: "XXL", stock: 0 },
    ],
    images: [
      { id: "img-1a", url: placeholder("#1a1a1a", "Oversize Front"), alt: "Camiseta Oversize NÓRVA vista frontal" },
      { id: "img-1b", url: placeholder("#2a2a2a", "Oversize Back"), alt: "Camiseta Oversize NÓRVA vista trasera" },
    ],
    availability: "inmediata",
    inventoryUpdatedAt: "2026-10-08",
  },
  {
    id: "prod-2",
    slug: "camiseta-basica-negra",
    name: "Camiseta Básica Negra",
    description: "Camiseta básica de corte regular en algodón 100%. Esencial para cualquier outfit.",
    price: 59900,
    categoryId: "cat-1",
    categorySlug: "camisetas",
    sizeType: "ropa",
    variants: [
      { size: "XS", stock: 0 },
      { size: "S", stock: 0 },
      { size: "M", stock: 0 },
      { size: "L", stock: 0 },
      { size: "XL", stock: 0 },
      { size: "XXL", stock: 0 },
    ],
    images: [
      { id: "img-2a", url: placeholder("#0d0d0d", "Básica Negra"), alt: "Camiseta Básica Negra" },
    ],
    availability: "bajo_confirmacion",
    inventoryUpdatedAt: "2026-10-05",
  },
  {
    id: "prod-3",
    slug: "camiseta-move-different",
    name: 'Camiseta "Move Different"',
    description: "Edición limitada con el slogan de la marca estampado en la espalda.",
    price: 99900,
    categoryId: "cat-1",
    categorySlug: "camisetas",
    sizeType: "ropa",
    variants: [
      { size: "XS", stock: 1 },
      { size: "S", stock: 4 },
      { size: "M", stock: 6 },
      { size: "L", stock: 3 },
      { size: "XL", stock: 0 },
      { size: "XXL", stock: 1 },
    ],
    images: [
      { id: "img-3a", url: placeholder("#333", "Move Different"), alt: 'Camiseta Move Different' },
    ],
    availability: "inmediata",
    inventoryUpdatedAt: "2026-10-09",
  },
  {
    id: "prod-4",
    slug: "pantalon-cargo-urban",
    name: "Pantalón Cargo Urban",
    description: "Pantalón cargo con bolsillos laterales y corte recto. Tela resistente y cómoda.",
    price: 149900,
    categoryId: "cat-2",
    categorySlug: "pantalones",
    sizeType: "ropa",
    variants: [
      { size: "XS", stock: 0 },
      { size: "S", stock: 2 },
      { size: "M", stock: 5 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 1 },
      { size: "XXL", stock: 0 },
    ],
    images: [
      { id: "img-4a", url: placeholder("#3d3d3d", "Cargo Front"), alt: "Pantalón Cargo Urban vista frontal" },
      { id: "img-4b", url: placeholder("#4a4a4a", "Cargo Detail"), alt: "Pantalón Cargo Urban detalle bolsillo" },
    ],
    availability: "inmediata",
    inventoryUpdatedAt: "2026-10-07",
  },
  {
    id: "prod-5",
    slug: "jogger-essential",
    name: "Jogger Essential",
    description: "Jogger de felpa con puños elásticos. Ideal para un look casual urbano.",
    price: 119900,
    categoryId: "cat-2",
    categorySlug: "pantalones",
    sizeType: "ropa",
    variants: [
      { size: "XS", stock: 2 },
      { size: "S", stock: 3 },
      { size: "M", stock: 7 },
      { size: "L", stock: 5 },
      { size: "XL", stock: 3 },
      { size: "XXL", stock: 1 },
    ],
    images: [
      { id: "img-5a", url: placeholder("#555", "Jogger"), alt: "Jogger Essential" },
    ],
    availability: "bajo_confirmacion",
    inventoryUpdatedAt: "2026-10-06",
  },
  {
    id: "prod-6",
    slug: "gorra-snapback-norva",
    name: "Gorra Snapback NÓRVA",
    description: "Gorra snapback con logo bordado. Talla única ajustable.",
    price: 49900,
    categoryId: "cat-3",
    categorySlug: "accesorios",
    sizeType: "unica",
    variants: [{ size: "Única", stock: 12 }],
    images: [
      { id: "img-6a", url: placeholder("#222", "Snapback"), alt: "Gorra Snapback NÓRVA" },
    ],
    availability: "inmediata",
    inventoryUpdatedAt: "2026-10-09",
  },
  {
    id: "prod-7",
    slug: "reloj-minimal-black",
    name: "Reloj Minimal Black",
    description: "Reloj analógico con correa de cuero negro y esfera minimalista.",
    price: 189900,
    categoryId: "cat-3",
    categorySlug: "accesorios",
    sizeType: "unica",
    variants: [{ size: "Única", stock: 4 }],
    images: [
      { id: "img-7a", url: placeholder("#111", "Reloj"), alt: "Reloj Minimal Black" },
    ],
    availability: "bajo_confirmacion",
    inventoryUpdatedAt: "2026-10-04",
  },
  {
    id: "prod-8",
    slug: "hoodie-oversized-gris",
    name: "Hoodie Oversized Gris",
    description: "Hoodie oversize de felpa gruesa con capucha doble. Comfort premium.",
    price: 159900,
    categoryId: "cat-1",
    categorySlug: "camisetas",
    sizeType: "ropa",
    variants: [
      { size: "XS", stock: 0 },
      { size: "S", stock: 1 },
      { size: "M", stock: 3 },
      { size: "L", stock: 2 },
      { size: "XL", stock: 0 },
      { size: "XXL", stock: 0 },
    ],
    images: [
      { id: "img-8a", url: placeholder("#666", "Hoodie Front"), alt: "Hoodie Oversized Gris vista frontal" },
      { id: "img-8b", url: placeholder("#777", "Hoodie Back"), alt: "Hoodie Oversized Gris vista trasera" },
    ],
    availability: "inmediata",
    inventoryUpdatedAt: "2026-10-08",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function isOutOfStock(product: Product): boolean {
  return product.variants.every((v) => v.stock === 0);
}
