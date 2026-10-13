import type { AdminProduct, SalesDoc } from "@/types";
import { products } from "./mock-data";

export const adminProducts: AdminProduct[] = products.map((p, i) => ({
  ...p,
  status: i === 1 ? "archivado" : i === 7 ? "borrador" : "publicado",
}));

export const salesDocs: SalesDoc[] = [
  {
    id: "doc-1",
    number: "NS-2026-00001",
    clientName: "Juan Pérez",
    clientEmail: "juan@example.com",
    date: "2026-10-01",
    lines: [
      { productId: "prod-1", productName: "Camiseta Oversize NÓRVA", size: "L", quantity: 1, unitPrice: 89900 },
      { productId: "prod-6", productName: "Gorra Snapback NÓRVA", size: "Única", quantity: 1, unitPrice: 49900 },
    ],
    total: 139800,
    status: "enviado",
  },
  {
    id: "doc-2",
    number: "NS-2026-00002",
    clientName: "María López",
    clientEmail: "maria@example.com",
    date: "2026-10-03",
    lines: [
      { productId: "prod-4", productName: "Pantalón Cargo Urban", size: "M", quantity: 2, unitPrice: 149900 },
    ],
    total: 299800,
    status: "enviado",
  },
  {
    id: "doc-3",
    number: "NS-2026-00003",
    clientName: "Carlos Ruiz",
    clientEmail: "carlos@example.com",
    date: "2026-10-07",
    lines: [
      { productId: "prod-3", productName: 'Camiseta "Move Different"', size: "M", quantity: 1, unitPrice: 99900 },
    ],
    total: 99900,
    status: "fallo",
  },
  {
    id: "doc-4",
    number: "NS-2026-00004",
    clientName: "Ana García",
    clientEmail: "ana@example.com",
    date: "2026-10-09",
    lines: [
      { productId: "prod-7", productName: "Reloj Minimal Black", size: "Única", quantity: 1, unitPrice: 189900 },
      { productId: "prod-5", productName: "Jogger Essential", size: "S", quantity: 1, unitPrice: 119900 },
    ],
    total: 309800,
    status: "enviado",
  },
];

export function getAdminProductById(id: string): AdminProduct | undefined {
  return adminProducts.find((p) => p.id === id);
}

export function getSalesDocById(id: string): SalesDoc | undefined {
  return salesDocs.find((d) => d.id === id);
}

export async function mockAction(delayMs = 600): Promise<void> {
  // TODO(Fase 5): replace with real API call
  await new Promise((r) => setTimeout(r, delayMs));
}
