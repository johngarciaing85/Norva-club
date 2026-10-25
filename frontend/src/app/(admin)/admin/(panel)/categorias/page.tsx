"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import {
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminListSizes,
  adminCreateSize,
  adminDeleteSize,
} from "@/lib/api/admin";
import type { SizeItem } from "@/lib/api/admin";
import type { Category, SizeType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const SIZE_TYPES: { value: SizeType; label: string }[] = [
  { value: "ropa", label: "Ropa" },
  { value: "calzado", label: "Calzado" },
  { value: "unica", label: "Talla única" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<SizeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Category form
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catSizeType, setCatSizeType] = useState<SizeType>("ropa");
  const [catSaving, setCatSaving] = useState(false);

  // Delete category
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);

  // Size form
  const [sizeLabel, setSizeLabel] = useState("");
  const [sizeGroup, setSizeGroup] = useState<SizeType>("ropa");
  const [sizeSaving, setSizeSaving] = useState(false);
  const [deleteSize, setDeleteSize] = useState<SizeItem | null>(null);

  async function loadData() {
    try {
      const [cats, szs] = await Promise.all([
        adminListCategories(),
        adminListSizes(),
      ]);
      setCategories(cats);
      setSizes(szs);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openNewCat() {
    setEditingCat(null);
    setCatName("");
    setCatSlug("");
    setCatDesc("");
    setCatSizeType("ropa");
    setShowCatForm(true);
  }

  function openEditCat(cat: Category) {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description);
    setCatSizeType(cat.sizeType);
    setShowCatForm(true);
  }

  function closeCatForm() {
    setShowCatForm(false);
    setEditingCat(null);
  }

  async function saveCat() {
    if (!catName.trim() || !catSlug.trim()) {
      toast.error("Nombre y slug son obligatorios");
      return;
    }
    setCatSaving(true);
    try {
      if (editingCat) {
        await adminUpdateCategory(editingCat.id, {
          name: catName,
          slug: catSlug,
          description: catDesc,
          sizeType: catSizeType,
        });
        toast.success("Categoría actualizada");
      } else {
        await adminCreateCategory({
          name: catName,
          slug: catSlug,
          description: catDesc,
          sizeType: catSizeType,
        });
        toast.success("Categoría creada");
      }
      closeCatForm();
      await loadData();
    } catch {
      toast.error("Error al guardar categoría");
    } finally {
      setCatSaving(false);
    }
  }

  async function confirmDeleteCat() {
    if (!deleteCat) return;
    try {
      await adminDeleteCategory(deleteCat.id);
      toast.success("Categoría eliminada");
      setDeleteCat(null);
      await loadData();
    } catch {
      toast.error("No se pudo eliminar (puede tener productos asociados)");
    }
  }

  async function addSize() {
    if (!sizeLabel.trim()) {
      toast.error("Escribe un nombre para la talla");
      return;
    }
    setSizeSaving(true);
    try {
      await adminCreateSize(sizeLabel.trim(), sizeGroup);
      toast.success(`Talla "${sizeLabel}" creada`);
      setSizeLabel("");
      await loadData();
    } catch {
      toast.error("Error al crear talla (puede que ya exista)");
    } finally {
      setSizeSaving(false);
    }
  }

  async function confirmDeleteSize() {
    if (!deleteSize) return;
    try {
      await adminDeleteSize(deleteSize.id);
      toast.success(`Talla "${deleteSize.label}" eliminada`);
      setDeleteSize(null);
      await loadData();
    } catch {
      toast.error("No se pudo eliminar (puede estar en uso por un producto)");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const selectClass =
    "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

  const sizesByGroup = SIZE_TYPES.map((st) => ({
    ...st,
    items: sizes.filter((s) => s.sizeGroup === st.value),
  }));

  return (
    <div className="p-6 space-y-10">
      {/* ── Categorías ────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Categorías</h1>
          <Button size="sm" onClick={openNewCat}>
            <Plus className="size-4 mr-1" />
            Nueva categoría
          </Button>
        </div>

        {showCatForm && (
          <div className="mb-6 rounded-lg border p-4 space-y-3 bg-muted/30">
            <h2 className="font-semibold text-sm">
              {editingCat ? "Editar categoría" : "Nueva categoría"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Nombre</Label>
                <Input
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCat) setCatSlug(slugify(e.target.value));
                  }}
                  placeholder="Ej: Camisetas"
                />
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="ej: camisetas"
                />
              </div>
              <div className="space-y-1">
                <Label>Descripción</Label>
                <Input
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Descripción corta"
                />
              </div>
              <div className="space-y-1">
                <Label>Tipo de talla</Label>
                <select
                  className={selectClass}
                  value={catSizeType}
                  onChange={(e) => setCatSizeType(e.target.value as SizeType)}
                >
                  {SIZE_TYPES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveCat} disabled={catSaving}>
                <Check className="size-4 mr-1" />
                {catSaving ? "Guardando..." : "Guardar"}
              </Button>
              <Button size="sm" variant="outline" onClick={closeCatForm}>
                <X className="size-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2 font-medium">Nombre</th>
                <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Tipo talla</th>
                <th className="px-4 py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5 font-medium">{cat.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell capitalize">
                    {cat.sizeType}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => openEditCat(cat)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                        title="Editar"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteCat(cat)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No hay categorías
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Tallas ────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold mb-4">Tallas</h2>

        <div className="mb-6 rounded-lg border p-4 space-y-3 bg-muted/30">
          <h3 className="font-semibold text-sm">Agregar nueva talla</h3>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input
                value={sizeLabel}
                onChange={(e) => setSizeLabel(e.target.value)}
                placeholder="Ej: 3XL"
                className="w-32"
              />
            </div>
            <div className="space-y-1">
              <Label>Grupo</Label>
              <select
                className={selectClass + " w-36"}
                value={sizeGroup}
                onChange={(e) => setSizeGroup(e.target.value as SizeType)}
              >
                {SIZE_TYPES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
            <Button size="sm" onClick={addSize} disabled={sizeSaving}>
              <Plus className="size-4 mr-1" />
              {sizeSaving ? "Creando..." : "Agregar"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {sizesByGroup.map((group) => (
            <div key={group.value}>
              <h3 className="text-sm font-semibold mb-2 capitalize">
                {group.label}
              </h3>
              {group.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay tallas en este grupo
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {group.items.map((size) => (
                    <div
                      key={size.id}
                      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm bg-background"
                    >
                      <span className="font-medium">{size.label}</span>
                      <button
                        onClick={() => setDeleteSize(size)}
                        className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Eliminar talla"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={!!deleteCat}
        onOpenChange={(open) => !open && setDeleteCat(null)}
        title="Eliminar categoría"
        description={`¿Eliminar "${deleteCat?.name}"? Los productos asociados quedarán sin categoría.`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={confirmDeleteCat}
      />

      <ConfirmDialog
        open={!!deleteSize}
        onOpenChange={(open) => !open && setDeleteSize(null)}
        title="Eliminar talla"
        description={`¿Eliminar la talla "${deleteSize?.label}"? No se podrá eliminar si hay productos usándola.`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={confirmDeleteSize}
      />
    </div>
  );
}
