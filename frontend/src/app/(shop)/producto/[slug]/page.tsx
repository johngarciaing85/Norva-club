import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProduct, fetchCategories, ApiError } from "@/lib/api/client";
import { formatCOP } from "@/lib/format";
import { ProductDetail } from "@/components/shop/ProductDetail";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await fetchProduct(slug);
    return {
      title: product.name,
      description: `${product.name} — ${formatCOP(product.price)}. ${product.description}`,
    };
  } catch {
    return { title: "Producto no encontrado" };
  }
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product;
  let categories;

  try {
    [product, categories] = await Promise.all([
      fetchProduct(slug),
      fetchCategories(),
    ]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-muted-foreground">
          No pudimos cargar el producto, intenta de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  const category = categories.find((c) => c.slug === product.categorySlug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/catalogo" className="hover:text-foreground transition-colors">
          Catálogo
        </Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/categoria/${category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>
      <ProductDetail product={product} sizeGuide={product.sizeGuide} />
    </div>
  );
}
