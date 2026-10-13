import { describe, it, expect } from "vitest";
import {
  loginSchema,
  productSchema,
  salesDocSchema,
  computeTotal,
} from "@/lib/validation";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "admin@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "admin@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("productSchema", () => {
  const validProduct = {
    name: "Camiseta Test",
    slug: "camiseta-test",
    description: "Una camiseta de prueba",
    price: 89900,
    categoryId: "cat-1",
    sizeType: "ropa" as const,
    availability: "inmediata" as const,
    status: "borrador" as const,
    variants: [{ size: "M", stock: 5 }],
  };

  it("accepts valid product", () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = productSchema.safeParse({ ...validProduct, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid slug", () => {
    const result = productSchema.safeParse({ ...validProduct, slug: "Has Spaces" });
    expect(result.success).toBe(false);
  });

  it("rejects zero price", () => {
    const result = productSchema.safeParse({ ...validProduct, price: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects decimal price", () => {
    const result = productSchema.safeParse({ ...validProduct, price: 89900.5 });
    expect(result.success).toBe(false);
  });

  it("rejects negative stock", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      variants: [{ size: "M", stock: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty variants", () => {
    const result = productSchema.safeParse({ ...validProduct, variants: [] });
    expect(result.success).toBe(false);
  });
});

describe("salesDocSchema", () => {
  const validLine = {
    productId: "prod-1",
    productName: "Camiseta",
    size: "M",
    quantity: 2,
    unitPrice: 89900,
    maxStock: 5,
  };

  const validDoc = {
    clientName: "Juan Pérez",
    clientEmail: "juan@example.com",
    date: "2026-10-09",
    lines: [validLine],
  };

  it("accepts valid comprobante", () => {
    const result = salesDocSchema.safeParse(validDoc);
    expect(result.success).toBe(true);
  });

  it("rejects empty client name", () => {
    const result = salesDocSchema.safeParse({ ...validDoc, clientName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = salesDocSchema.safeParse({ ...validDoc, clientEmail: "bad" });
    expect(result.success).toBe(false);
  });

  it("rejects empty lines", () => {
    const result = salesDocSchema.safeParse({ ...validDoc, lines: [] });
    expect(result.success).toBe(false);
  });

  it("rejects empty date", () => {
    const result = salesDocSchema.safeParse({ ...validDoc, date: "" });
    expect(result.success).toBe(false);
  });

  it("rejects quantity exceeding stock (superRefine)", () => {
    const doc = {
      ...validDoc,
      lines: [{ ...validLine, quantity: 10, maxStock: 5 }],
    };
    const result = salesDocSchema.safeParse(doc);
    expect(result.success).toBe(false);
    if (!result.success) {
      const qtyIssue = result.error.issues.find(
        (issue) => issue.path.join(".") === "lines.0.quantity"
      );
      expect(qtyIssue).toBeDefined();
      expect(qtyIssue!.message).toContain("Stock insuficiente");
    }
  });

  it("accepts quantity equal to stock", () => {
    const doc = {
      ...validDoc,
      lines: [{ ...validLine, quantity: 5, maxStock: 5 }],
    };
    expect(salesDocSchema.safeParse(doc).success).toBe(true);
  });
});

describe("computeTotal", () => {
  it("sums line totals correctly", () => {
    expect(
      computeTotal([
        { quantity: 2, unitPrice: 89900 },
        { quantity: 1, unitPrice: 49900 },
      ])
    ).toBe(229700);
  });

  it("returns 0 for empty lines", () => {
    expect(computeTotal([])).toBe(0);
  });

  it("handles single line", () => {
    expect(computeTotal([{ quantity: 3, unitPrice: 100000 }])).toBe(300000);
  });
});
