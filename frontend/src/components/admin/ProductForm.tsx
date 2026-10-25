"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { productSchema, type ProductFormData } from "@/lib/validation";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminArchiveProduct,
  adminListCategories,
  adminListSizes,
} from "@/lib/api/admin";
import type { SizeItem } from "@/lib/api/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./ConfirmDialog";
import { ImageUploader } from "./ImageUploader";
import type { AdminProduct, Category, SizeType } from "@/types";

const FALLBACK_SIZES: Record<SizeType, string[]> = {
  ropa: ["XS", "S", "M", "L", "XL", "XXL"],
  calzado: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
  unica: ["Única"],
};

interface ImageData {
  id?: string;
  url: string;
  alt?: string;
  publicId?: string | null;
}

interface ProductFormProps {
  product?: AdminProduct & { sizeGuide?: string | null };
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSizes, setAllSizes] = useState<SizeItem[]>([]);
  const [images, setImages] = useState<ImageData[]>(
    product?.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      publicId: (img as ImageData).publicId ?? null,
    })) ?? [],
  );

  useEffect(() => {
    adminListCategories().then(setCategories).catch(() => {});
    adminListSizes().then(setAllSizes).catch(() => {});
  }, []);

  function getSizesForType(sizeType: SizeType): string[] {
    const fromApi = allSizes
      .filter((s) => s.sizeGroup === sizeType)
      .map((s) => s.label);
    return fromApi.length > 0 ? fromApi : (FALLBACK_SIZES[sizeType] ?? []);
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          sizeType: product.sizeType,
          availability: product.availability,
          status: product.status,
          variants: product.variants,
        }
      : {
          name: "",
          slug: "",
          description: "",
          price: 0,
          categoryId: "",
          sizeType: "ropa",
          availability: "inmediata",
          status: "borrador",
          variants: FALLBACK_SIZES.ropa.map((s) => ({ size: s, stock: 0 })),
        },
  });

  const { fields, replace, remove, append } = useFieldArray({ control, name: "variants" });

  const selectedCategoryId = watch("categoryId");
  const selectedSizeType = watch("sizeType");

  useEffect(() => {
    if (!isEditing && allSizes.length > 0 && fields.length > 0) {
      const apiSizes = getSizesForType(selectedSizeType);
      if (apiSizes.length > 0) {
        replace(apiSizes.map((s) => ({ size: s, stock: 0 })));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSizes]);

  useEffect(() => {
    const cat = categories.find((c) => c.id === selectedCategoryId);
    if (cat && cat.sizeType !== selectedSizeType) {
      setValue("sizeType", cat.sizeType);
      replace(getSizesForType(cat.sizeType).map((s) => ({ size: s, stock: 0 })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, selectedSizeType, setValue, replace, categories, allSizes]);

  async function onSubmit(data: ProductFormData) {
    try {
      const payload = {
        ...data,
        images: images.map((img, i) => ({
          id: img.id,
          url: img.url,
          alt: img.alt ?? "",
          publicId: img.publicId,
          sortOrder: i,
        })),
      };

      if (isEditing && product) {
        await adminUpdateProduct(product.id, payload);
        toast.success("Producto actualizado");
      } else {
        await adminCreateProduct(payload);
        toast.success("Producto creado");
      }
      router.push("/admin/productos");
    } catch {
      toast.error("Error al guardar el producto");
    }
  }

  async function handleArchive() {
    if (!product) return;
    try {
      await adminArchiveProduct(product.id);
      toast.success("Producto archivado");
      router.push("/admin/productos");
    } catch {
      toast.error("Error al archivar el producto");
    }
  }

  function handleBack() {
    if (isDirty) {
      setShowLeaveDialog(true);
    } else {
      router.push("/admin/productos");
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" {...register("slug")} />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" rows={3} {...register("description")} />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="price">Precio (COP)</Label>
            <Input
              id="price"
              type="number"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoría</Label>
            <select
              id="categoryId"
              className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register("categoryId")}
            >
              <option value="">Seleccionar…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Disponibilidad</Label>
            <select
              id="availability"
              className="flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register("availability")}
            >
              <option value="inmediata">Inmediata</option>
              <option value="bajo_confirmacion">Bajo confirmación</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            className="flex h-8 w-full max-w-xs rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("status")}
          >
            <option value="borrador">Borrador</option>
            <option value="publicado">Publicado</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>

        <div className="space-y-3">
          <Label>Tallas y stock</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {field.size}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Quitar talla"
                  >
                    <span className="text-xs">✕</span>
                  </button>
                </div>
                <Input
                  type="number"
                  min={0}
                  {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                  className="tabular-nums"
                />
              </div>
            ))}
          </div>

          {/* Add size */}
          {(() => {
            const currentSizes = new Set(fields.map((f) => f.size));
            const available = getSizesForType(selectedSizeType).filter(
              (s) => !currentSizes.has(s),
            );
            if (available.length === 0) return null;
            return (
              <div className="flex gap-2 items-center">
                <select
                  id="add-size-select"
                  className="flex h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  defaultValue=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    append({ size: val, stock: 0 });
                    e.target.value = "";
                  }}
                >
                  <option value="">+ Agregar talla...</option>
                  {available.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            );
          })()}

          {errors.variants && (
            <p className="text-xs text-destructive">
              {errors.variants.message ?? errors.variants.root?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Imágenes</Label>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando…"
              : isEditing
                ? "Guardar cambios"
                : "Crear producto"}
          </Button>
          {isEditing && product.status !== "archivado" && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowArchiveDialog(true)}
            >
              Archivar
            </Button>
          )}
          <Button type="button" variant="outline" onClick={handleBack}>
            Cancelar
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        title="Cambios sin guardar"
        description="Tienes cambios sin guardar. ¿Deseas salir de todas formas?"
        confirmLabel="Salir sin guardar"
        variant="destructive"
        onConfirm={() => router.push("/admin/productos")}
      />

      {isEditing && (
        <ConfirmDialog
          open={showArchiveDialog}
          onOpenChange={setShowArchiveDialog}
          title="Archivar producto"
          description={`¿Estás seguro de archivar "${product.name}"? El producto dejará de mostrarse en la tienda.`}
          confirmLabel="Archivar"
          variant="destructive"
          onConfirm={handleArchive}
        />
      )}
    </>
  );
}
