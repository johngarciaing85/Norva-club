import type { Metadata } from "next";
import { products } from "@/lib/mock-data";
import { CategoryFilter } from "./CategoryFilter";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora toda nuestra colección de streetwear colombiano.",
};

export default function CatalogoPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-wider mb-8">
        Catálogo
      </h1>
      <CategoryFilter products={products} />
    </div>
  );
}
