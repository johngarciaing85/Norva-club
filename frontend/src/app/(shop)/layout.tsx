import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { IntroAnimation } from "@/components/brand/IntroAnimation";
import { fetchCategories } from "@/lib/api/client";
import type { Category } from "@/types";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  let categories: Category[] = [];
  try {
    categories = await fetchCategories();
  } catch {
    // Header renders with no category links if API is down
  }

  return (
    <>
      <IntroAnimation />
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
