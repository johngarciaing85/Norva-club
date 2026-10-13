"use client";

import Link from "next/link";
import {
  Package,
  PackageX,
  AlertTriangle,
  CalendarClock,
  FileCheck,
} from "lucide-react";
import { adminProducts, salesDocs } from "@/lib/admin-mock-data";
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
  const published = adminProducts.filter((p) => p.status === "publicado");

  const publishedCount = published.length;

  const outOfStockProducts = published.filter((p) =>
    p.variants.every((v) => v.stock === 0)
  ).length;

  const outOfStockSizes = published.reduce(
    (count, p) => count + p.variants.filter((v) => v.stock === 0).length,
    0
  );

  const lastUpdate = adminProducts.reduce(
    (latest, p) => (p.updatedAt > latest ? p.updatedAt : latest),
    ""
  );

  const currentMonth = lastUpdate.substring(0, 7);
  const sentThisMonth = salesDocs.filter(
    (d) => d.status === "enviado" && d.date.startsWith(currentMonth)
  ).length;

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
          href="/admin/inventario"
        />
        <StatCard
          title="Tallas agotadas"
          value={outOfStockSizes}
          icon={AlertTriangle}
          href="/admin/inventario"
        />
        <StatCard
          title="Última actualización"
          value={formatDate(lastUpdate)}
          icon={CalendarClock}
          href="/admin/inventario"
        />
        <StatCard
          title="Comprobantes enviados"
          value={sentThisMonth}
          icon={FileCheck}
          href="/admin/comprobantes"
        />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 font-heading text-base font-semibold">Acceso rápido</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/inventario"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Actualizar inventario
          </Link>
          <Link
            href="/admin/comprobantes/nuevo"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Nuevo comprobante
          </Link>
        </div>
      </div>
    </div>
  );
}
