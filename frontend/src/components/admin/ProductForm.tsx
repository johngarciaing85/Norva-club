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
} from "@/lib/api/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./ConfirmDialog";
import { ImageUploader } from "./ImageUploader";
import type { AdminProduct, Category, SizeType } from "@/types";

const ROPA_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CALZADO_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];
const UNICA_SIZES = ["Única"];

function getSizesForType(sizeType: SizeType): string[] {
  switch (sizeType) {
    case "ropa":
      return ROPA_SIZES;
    case "calzado":
      return CALZADO_SIZES;
    case "unica":
      return UNICA_SIZES;
  }
}

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
  }, []);

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
          variants: ROPA_SIZES.map((s) => ({ size: s, stock: 0 })),
        },
  });

  const { fields, replace } = useFieldArray({ control, name: "variants" });

  const selectedCategoryId = watch("categoryId");
  const selectedSizeType = watch("sizeType");

  useEffect(() => {
    const cat = categories.find((c) => c.id === selectedCategoryId);
    if (cat && cat.sizeType !== selectedSizeType) {
      setValue("sizeType", cat.sizeType);
      replace(getSizesForType(cat.sizeType).map((s) => ({ size: s, stock: 0 })));
    }
  }, [selectedCategoryId, selectedSizeType, setValue, replace, categories]);

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
                <span className="text-xs font-medium text-muted-foreground">
                  {field.size}
                </span>
                <Input
                  type="number"
                  min={0}
                  {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                  className="tabular-nums"
                />
              </div>
            ))}
          </div>
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
