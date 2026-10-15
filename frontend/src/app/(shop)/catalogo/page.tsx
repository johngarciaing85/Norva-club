import type { Metadata } from "next";
import { fetchCategories, fetchProducts } from "@/lib/api/client";
import { CategoryFilter } from "./CategoryFilter";

export const instant = false;

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora toda nuestra colección de streetwear colombiano.",
};

export default async function CatalogoPage() {
  let categories;
  let data;

  try {
    [categories, data] = await Promise.all([
      fetchCategories(),
      fetchProducts(),
    ]);
  } catch {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-muted-foreground">
          No pudimos cargar el catálogo, intenta de nuevo en unos minutos.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-wider mb-8">
        Catálogo
      </h1>
      <CategoryFilter products={data.products} categories={categories} />
    </div>
  );
}
