"use client";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAdminProductById } from "@/lib/admin-mock-data";
import { ProductForm } from "@/components/admin/ProductForm";

async function EditarProductoContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getAdminProductById(id);
  if (!product) notFound();

  return (
    <div className="space-y-4 p-4 pb-20 md:p-6 md:pb-6">
      <h1 className="font-heading text-xl font-bold">Editar: {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}

export default function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense>
      <EditarProductoContent params={params} />
    </Suspense>
  );
}
