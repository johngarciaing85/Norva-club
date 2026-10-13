import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCategories, fetchProducts, ApiError } from "@/lib/api/client";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const categories = await fetchCategories();
    const category = categories.find((c) => c.slug === slug);
    if (!category) return { title: "Categoría no encontrada" };
    return {
      title: category.name,
      description: category.description,
    };
  } catch {
    return { title: "Categoría" };
  }
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let categories;
  let data;

  try {
    [categories, data] = await Promise.all([
      fetchCategories(),
      fetchProducts(slug),
    ]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-muted-foreground">
          No pudimos cargar el catálogo, intenta de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-wider mb-2">
        {category.name}
      </h1>
      <p className="text-muted-foreground mb-8">{category.description}</p>
      <ProductGrid products={data.products} />
    </div>
  );
}
