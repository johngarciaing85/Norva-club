import Link from "next/link";
import type { Metadata } from "next";
import { fetchCategories, fetchProducts } from "@/lib/api/client";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { HeroVideo } from "@/components/shop/HeroVideo";

export const instant = false;

export const metadata: Metadata = {
  title: "NÓRVA STYLE — Streetwear Colombiano",
  description:
    "Tienda de ropa streetwear colombiana. Camisetas, pantalones y accesorios urbanos. Move Different.",
};

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof fetchCategories>> = [];
  let products: Awaited<ReturnType<typeof fetchProducts>> | null = null;

  try {
    [categories, products] = await Promise.all([
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
    <>
      <section className="relative flex items-center justify-center overflow-hidden bg-black text-white min-h-[80vh] sm:min-h-[90vh] px-4">
        <HeroVideo src="/hero-bg.mp4" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center space-y-4">
          <h1 className="font-heading font-bold text-4xl sm:text-6xl lg:text-7xl tracking-[0.12em] uppercase drop-shadow-lg">
            N&Oacute;RVA STYLE
          </h1>
          <p className="text-sm sm:text-base tracking-[0.3em] uppercase text-white/70">
            Move Different.
          </p>
          <div className="pt-6">
            <Link
              href="/catalogo"
              className="inline-block border border-white/40 hover:border-white hover:bg-white/10 px-10 py-3.5 text-sm tracking-widest uppercase transition-all duration-300"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="font-heading text-xl font-bold uppercase tracking-wider mb-8">
          Categorías
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="group relative flex items-end overflow-hidden rounded-lg bg-foreground p-6 h-40 transition-transform hover:scale-[1.02]"
            >
              <div>
                <h3 className="font-heading text-lg font-bold text-background uppercase tracking-wider">
                  {cat.name}
                </h3>
                <p className="text-xs text-background/60 mt-1">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <h2 className="font-heading text-xl font-bold uppercase tracking-wider mb-8">
          Productos
        </h2>
        <ProductGrid products={products.products} />
      </section>
    </>
  );
}
