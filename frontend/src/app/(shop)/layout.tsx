import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { IntroAnimation } from "@/components/brand/IntroAnimation";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IntroAnimation />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
