import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatCOP } from "@/lib/format";
import { isOutOfStock } from "@/lib/mock-data";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const soldOut = isOutOfStock(product);

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
        <Image
          src={product.images[0]?.url ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        {soldOut && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-background/90 text-foreground text-xs uppercase tracking-wider"
          >
            Agotado
          </Badge>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className={`text-sm font-semibold ${soldOut ? "text-muted-foreground" : ""}`}>
          {formatCOP(product.price)}
        </p>
      </div>
    </Link>
  );
}
