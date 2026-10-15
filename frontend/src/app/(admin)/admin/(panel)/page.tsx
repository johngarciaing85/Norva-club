"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  PackageX,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import { adminListProducts } from "@/lib/api/admin";
import type { AdminProductDetail } from "@/lib/api/admin";
import { formatDate } from "@/lib/format";

function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold tabular-nums">{value}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<AdminProductDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminListProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const published = products.filter((p) => p.status === "publicado");
  const publishedCount = published.length;

  const outOfStockProducts = published.filter((p) =>
    p.variants.every((v) => v.stock === 0),
  ).length;

  const outOfStockSizes = published.reduce(
    (count, p) => count + p.variants.filter((v) => v.stock === 0).length,
    0,
  );

  const lastUpdate = products.reduce(
    (latest, p) =>
      (p.inventoryUpdatedAt ?? "") > latest
        ? p.inventoryUpdatedAt!
        : latest,
    "",
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pb-20 md:p-6 md:pb-6">
      <h1 className="font-heading text-xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Productos publicados"
          value={publishedCount}
          icon={Package}
          href="/admin/productos"
        />
        <StatCard
          title="Productos agotados"
          value={outOfStockProducts}
          icon={PackageX}
          href="/admin/productos"
        />
        <StatCard
          title="Tallas agotadas"
          value={outOfStockSizes}
          icon={AlertTriangle}
          href="/admin/productos"
        />
        <StatCard
          title="Última actualización"
          value={lastUpdate ? formatDate(lastUpdate) : "—"}
          icon={CalendarClock}
          href="/admin/productos"
        />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 font-heading text-base font-semibold">Acceso rápido</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Nuevo producto
          </Link>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    </div>
  );
}
