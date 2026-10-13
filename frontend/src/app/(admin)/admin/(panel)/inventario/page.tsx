"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronRight, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { adminProducts } from "@/lib/admin-mock-data";
import { mockAction } from "@/lib/admin-mock-data";
import { categories } from "@/lib/mock-data";
import { StockStepper } from "@/components/admin/StockStepper";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

interface StockState {
  [productId: string]: { [size: string]: number };
}

function buildInitialStock(): StockState {
  const state: StockState = {};
  for (const product of adminProducts) {
    state[product.id] = {};
    for (const v of product.variants) {
      state[product.id][v.size] = v.stock;
    }
  }
  return state;
}

export default function InventarioPage() {
  const [stock, setStock] = useState<StockState>(buildInitialStock);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("todos");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const products = useMemo(() => {
    return adminProducts
      .filter((p) => p.status !== "archivado")
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === "todos" || p.categoryId === categoryFilter;
        return matchesSearch && matchesCategory;
      });
  }, [search, categoryFilter]);

  const modifiedCount = useMemo(() => {
    let count = 0;
    for (const product of adminProducts) {
      for (const v of product.variants) {
        if (stock[product.id]?.[v.size] !== v.stock) count++;
      }
    }
    return count;
  }, [stock]);

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const updateStock = useCallback((productId: string, size: string, value: number) => {
    setStock((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [size]: value },
    }));
  }, []);

  const setAgotado = useCallback((productId: string) => {
    setStock((prev) => {
      const sizes = { ...prev[productId] };
      for (const key of Object.keys(sizes)) {
        sizes[key] = 0;
      }
      return { ...prev, [productId]: sizes };
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      // TODO(Fase 6): replace with real API call to update stock
      await mockAction(1000);
      toast.success(`${modifiedCount} cambio(s) guardados`);
      setShowSaveDialog(false);
    } catch {
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-28 md:pb-6">
      <div className="space-y-4 p-4 md:p-6">
        <div>
          <h1 className="font-heading text-xl font-bold">Inventario</h1>
          <p className="text-sm text-muted-foreground">
            Actualiza el stock desde tu celular. Modifica las cantidades y guarda al final.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar producto…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="todos">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          {products.map((product) => {
            const isExpanded = expanded.has(product.id);
            const productStock = stock[product.id] ?? {};
            const hasModified = product.variants.some(
              (v) => productStock[v.size] !== v.stock
            );
            const totalStock = Object.values(productStock).reduce((a, b) => a + b, 0);

            return (
              <div
                key={product.id}
                className={cn(
                  "rounded-lg border transition-colors",
                  hasModified && "border-blue-300 bg-blue-50/50"
                )}
              >
                <button
                  onClick={() => toggleExpanded(product.id)}
                  className="flex w-full items-center gap-3 p-3 text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Stock total: {totalStock}
                      {hasModified && " · Modificado"}
                    </p>
                  </div>
                  {totalStock === 0 && (
                    <span className="shrink-0 rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                      AGOTADO
                    </span>
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t px-3 pb-3 pt-2">
                    <div className="space-y-2">
                      {product.variants.map((v) => (
                        <div
                          key={v.size}
                          className="flex items-center justify-between"
                        >
                          <span className="w-12 text-sm font-medium">{v.size}</span>
                          <StockStepper
                            value={productStock[v.size] ?? 0}
                            originalValue={v.stock}
                            onChange={(val) => updateStock(product.id, v.size, val)}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-destructive"
                        onClick={() => setAgotado(product.id)}
                      >
                        Marcar todo como agotado
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {products.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No se encontraron productos
            </p>
          )}
        </div>
      </div>

      {/* Fixed save button */}
      {modifiedCount > 0 && (
        <div className="fixed inset-x-0 bottom-14 z-30 border-t bg-background p-3 shadow-lg md:bottom-0">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <span className="text-sm font-medium">
              {modifiedCount} cambio{modifiedCount !== 1 && "s"} pendiente{modifiedCount !== 1 && "s"}
            </span>
            <Button onClick={() => setShowSaveDialog(true)}>
              <Save className="size-4" data-icon="inline-start" />
              Guardar cambios
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        title="Guardar cambios de stock"
        description={`¿Confirmas los ${modifiedCount} cambio(s) en el inventario?`}
        confirmLabel="Guardar"
        onConfirm={handleSave}
        loading={saving}
      />
    </div>
  );
}
