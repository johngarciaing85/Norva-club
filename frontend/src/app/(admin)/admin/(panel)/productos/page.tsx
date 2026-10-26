"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { adminListProducts } from "@/lib/api/admin";
import type { AdminProductDetail } from "@/lib/api/admin";
import { formatCOP } from "@/lib/format";
import { ProductStatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProductStatus } from "@/types";

const statusOptions: { value: ProductStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "publicado", label: "Publicados" },
  { value: "borrador", label: "Borradores" },
  { value: "archivado", label: "Archivados" },
];

export default function ProductosPage() {
  const [products, setProducts] = useState<AdminProductDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "todos">("todos");

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    const data = await adminListProducts(
      search || undefined,
      statusFilter !== "todos" ? statusFilter : undefined,
    );
    setProducts(data);
    setIsLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  const totalStock = (variants: { stock: number }[]) =>
    variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div className="space-y-4 p-4 pb-20 md:p-6 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button size="sm">
            <Plus className="size-4" data-icon="inline-start" />
            Nuevo
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden rounded-lg border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatCOP(product.price)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {totalStock(product.variants)}
                    </TableCell>
                    <TableCell>
                      <ProductStatusBadge status={product.status} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/productos/${product.id}`}>
                        <Button variant="ghost" size="xs">
                          Editar
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/admin/productos/${product.id}`}
                className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    <span className="font-mono text-xs">{product.id.slice(0, 8)}</span>
                    {" · "}{formatCOP(product.price)} · Stock: {totalStock(product.variants)}
                  </p>
                </div>
                <ProductStatusBadge status={product.status} />
              </Link>
            ))}
            {products.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No se encontraron productos
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
