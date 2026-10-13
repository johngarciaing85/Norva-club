"use client";

import { useState } from "react";
import { categories } from "@/lib/mock-data";
import { ProductGrid } from "@/components/shop/ProductGrid";
import type { Product } from "@/types";

interface CategoryFilterProps {
  products: Product[];
}

export function CategoryFilter({ products }: CategoryFilterProps) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = active
    ? products.filter((p) => p.categorySlug === active)
    : products;

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActive(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
            active === null
              ? "bg-foreground text-background border-foreground"
              : "border-border hover:border-foreground"
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActive(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              active === cat.slug
                ? "bg-foreground text-background border-foreground"
                : "border-border hover:border-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <ProductGrid products={filtered} />
    </>
  );
}
