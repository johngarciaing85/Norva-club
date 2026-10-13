import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton";
import type { Product } from "@/types";

afterEach(cleanup);

const baseProduct: Product = {
  id: "p1",
  slug: "test-product",
  name: "Test Product",
  description: "A test product",
  price: 89900,
  categoryId: "c1",
  categorySlug: "camisetas",
  sizeType: "ropa",
  variants: [
    { size: "M", stock: 5 },
    { size: "L", stock: 3 },
  ],
  images: [],
  availability: "inmediata",
  updatedAt: "2026-10-09",
};

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "573001234567");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("WhatsAppButton", () => {
  it('shows "Comprar por WhatsApp" for inmediata availability', () => {
    render(
      <WhatsAppButton
        product={baseProduct}
        selectedSize="M"
        needsSize={true}
        availability="inmediata"
      />
    );
    expect(screen.getByText("Comprar por WhatsApp")).toBeInTheDocument();
  });

  it('shows "Consultar disponibilidad" for bajo_confirmacion availability', () => {
    render(
      <WhatsAppButton
        product={{ ...baseProduct, availability: "bajo_confirmacion" }}
        selectedSize="M"
        needsSize={true}
        availability="bajo_confirmacion"
      />
    );
    expect(screen.getByText("Consultar disponibilidad")).toBeInTheDocument();
  });

  it("shows disabled message when WHATSAPP_NUMBER is not set", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    render(
      <WhatsAppButton
        product={baseProduct}
        selectedSize="M"
        needsSize={true}
        availability="inmediata"
      />
    );
    expect(screen.getByText("WhatsApp no configurado (desarrollo)")).toBeInTheDocument();
  });

  it('shows "Elige una talla primero" when size is needed but not selected', () => {
    render(
      <WhatsAppButton
        product={baseProduct}
        selectedSize={null}
        needsSize={true}
        availability="inmediata"
      />
    );
    expect(screen.getByText("Elige una talla primero")).toBeInTheDocument();
  });
});
