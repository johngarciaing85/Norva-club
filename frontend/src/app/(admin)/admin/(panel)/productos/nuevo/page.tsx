import { ProductForm } from "@/components/admin/ProductForm";

export default function NuevoProductoPage() {
  return (
    <div className="space-y-4 p-4 pb-20 md:p-6 md:pb-6">
      <h1 className="font-heading text-xl font-bold">Nuevo producto</h1>
      <ProductForm />
    </div>
  );
}
