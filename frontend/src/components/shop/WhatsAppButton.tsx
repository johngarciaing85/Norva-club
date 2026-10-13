"use client";

import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/format";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Product, Availability } from "@/types";

interface WhatsAppButtonProps {
  product: Product;
  selectedSize: string | null;
  needsSize: boolean;
  availability: Availability;
}

function buttonLabel(availability: Availability): string {
  return availability === "inmediata"
    ? "Comprar por WhatsApp"
    : "Consultar disponibilidad";
}

export function WhatsAppButton({
  product,
  selectedSize,
  needsSize,
  availability,
}: WhatsAppButtonProps) {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!phoneNumber) {
    return (
      <Button disabled size="lg" className="w-full h-11">
        WhatsApp no configurado (desarrollo)
      </Button>
    );
  }

  if (needsSize && !selectedSize) {
    return (
      <Button
        size="lg"
        className="w-full h-11"
        onClick={() => {
          const legend = document.querySelector<HTMLElement>("fieldset legend");
          legend?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
      >
        Elige una talla primero
      </Button>
    );
  }

  const message = buildWhatsAppMessage({
    productName: product.name,
    size: needsSize ? selectedSize ?? undefined : undefined,
    price: formatCOP(product.price),
    productUrl: `${siteUrl}/producto/${product.slug}`,
  });

  const url = buildWhatsAppUrl(phoneNumber, message);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-black transition-all hover:bg-[#1fb855] outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {buttonLabel(availability)}
    </a>
  );
}
