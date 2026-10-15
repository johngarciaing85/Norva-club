"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { adminGetProduct } from "@/lib/api/admin";
import type { AdminProductDetail } from "@/lib/api/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export default function EditarProductoPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    adminGetProduct(params.id)
      .then(setProduct)
      .catch(() => setNotFoundState(true))
      .finally(() => setIsLoading(false));
  }, [params.id]);

  if (notFoundState) return notFound();

  if (isLoading || !product) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-muted-foreground">Cargando producto…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 pb-20 md:p-6 md:pb-6">
      <h1 className="font-heading text-xl font-bold">Editar: {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}
