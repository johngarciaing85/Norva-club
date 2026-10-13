import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getProductBySlug, getCategoryBySlug } from "@/lib/mock-data";
import { formatCOP } from "@/lib/format";
import { ProductDetail } from "@/components/shop/ProductDetail";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: `${product.name} — ${formatCOP(product.price)}. ${product.description}`,
  };
}

async function ProductoContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryBySlug(product.categorySlug);

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
      <ProductDetail product={product} />
    </div>
  );
}

export default function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense>
      <ProductoContent params={params} />
    </Suspense>
  );
}
