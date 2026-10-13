import { describe, it, expect } from "vitest";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

describe("buildWhatsAppMessage", () => {
  it("builds a message with size", () => {
    const msg = buildWhatsAppMessage({
      productName: "Camiseta Oversize NÓRVA",
      size: "M",
      price: "$89.900",
      productUrl: "http://localhost:3000/producto/camiseta-oversize-norva",
    });
    expect(msg).toContain("Camiseta Oversize NÓRVA");
    expect(msg).toContain("talla M");
    expect(msg).toContain("$89.900 COP");
    expect(msg).toContain("http://localhost:3000/producto/camiseta-oversize-norva");
    expect(msg).toContain("disponibilidad");
  });

  it("builds a message without size (accessory)", () => {
    const msg = buildWhatsAppMessage({
      productName: "Gorra Snapback",
      price: "$49.900",
      productUrl: "http://localhost:3000/producto/gorra-snapback",
    });
    expect(msg).not.toContain("talla");
    expect(msg).toContain("Gorra Snapback");
    expect(msg).toContain("$49.900 COP");
  });
});

describe("buildWhatsAppUrl", () => {
  it("builds a valid WhatsApp URL", () => {
    const url = buildWhatsAppUrl("573001234567", "Hola mundo");
    expect(url).toBe("https://wa.me/573001234567?text=Hola%20mundo");
  });

  it("encodes special characters", () => {
    const url = buildWhatsAppUrl("573001234567", "Precio: $89.900");
    expect(url).toContain("https://wa.me/573001234567?text=");
    expect(url).toContain(encodeURIComponent("Precio: $89.900"));
  });
});
