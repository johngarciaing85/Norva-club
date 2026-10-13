"use client";

import { useState } from "react";
import { ImageGallery } from "./ImageGallery";
import { SizeSelector } from "./SizeSelector";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { WhatsAppButton } from "./WhatsAppButton";
import { formatCOP } from "@/lib/format";
import { isOutOfStock } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const soldOut = isOutOfStock(product);
  const needsSize = product.sizeType !== "unica";

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ImageGallery images={product.images} />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-2 text-xl font-semibold">
            {formatCOP(product.price)}
          </p>
        </div>

        {soldOut && (
          <Badge variant="secondary" className="text-sm uppercase tracking-wider">
            Agotado
          </Badge>
        )}

        <p className="text-sm text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        {needsSize && !soldOut && (
          <SizeSelector
            variants={product.variants}
            selected={selectedSize}
            onSelect={setSelectedSize}
          />
        )}

        <AvailabilityBadge
          availability={product.availability}
          updatedAt={product.updatedAt}
        />

        {!soldOut && (
          <WhatsAppButton
            product={product}
            selectedSize={selectedSize}
            needsSize={needsSize}
            availability={product.availability}
          />
        )}
      </div>
    </div>
  );
}
