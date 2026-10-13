import { Badge } from "@/components/ui/badge";
import type { ProductStatus, SalesDocStatus } from "@/types";
import { cn } from "cn";

const productStatusConfig: Record<ProductStatus, { label: string; className: string }> = {
  borrador: { label: "Borrador", className: "bg-yellow-100 text-yellow-800" },
  publicado: { label: "Publicado", className: "bg-green-100 text-green-800" },
  archivado: { label: "Archivado", className: "bg-gray-100 text-gray-600" },
};

const salesDocStatusConfig: Record<SalesDocStatus, { label: string; className: string }> = {
  borrador: { label: "Borrador", className: "bg-yellow-100 text-yellow-800" },
  enviado: { label: "Enviado", className: "bg-green-100 text-green-800" },
  fallo: { label: "Fallo", className: "bg-red-100 text-red-800" },
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const config = productStatusConfig[status];
  return (
    <Badge variant="secondary" className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}

export function SalesDocStatusBadge({ status }: { status: SalesDocStatus }) {
  const config = salesDocStatusConfig[status];
  return (
    <Badge variant="secondary" className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}
