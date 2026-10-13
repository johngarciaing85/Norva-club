import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getProductsByCategory, getCategoryBySlug } from "@/lib/mock-data";
import { ProductGrid } from "@/components/shop/ProductGrid";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "Categoría no encontrada" };
  return {
    title: category.name,
    description: category.description,
  };
}

async function CategoriaContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryProducts = getProductsByCategory(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-wider mb-2">
        {category.name}
      </h1>
      <p className="text-muted-foreground mb-8">{category.description}</p>
      <ProductGrid products={categoryProducts} />
    </div>
  );
}

export default function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense>
      <CategoriaContent params={params} />
    </Suspense>
  );
}
