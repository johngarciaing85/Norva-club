"use client";

import { useState } from "react";
import { ImageGallery } from "./ImageGallery";
import { SizeSelector } from "./SizeSelector";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { WhatsAppButton } from "./WhatsAppButton";
import { formatCOP, isOutOfStock } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";

interface ProductDetailProps {
  product: Product;
  sizeGuide?: string | null;
}

export function ProductDetail({ product, sizeGuide }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const soldOut = isOutOfStock(product.variants);
  const needsSize = product.sizeType !== "unica";

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ImageGallery images={product.images} />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold sm:text-3xl">
            {product.name}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-xl font-semibold">
              {formatCOP(product.price)}
            </p>
            {product.gender !== "unisex" && (
              <Badge variant="outline" className="text-xs uppercase tracking-wider">
                {product.gender === "dama" ? "Dama" : "Caballero"}
              </Badge>
            )}
          </div>
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
          inventoryUpdatedAt={product.inventoryUpdatedAt}
        />

        {!soldOut && (
          <WhatsAppButton
            product={product}
            selectedSize={selectedSize}
            needsSize={needsSize}
            availability={product.availability}
          />
        )}

        {sizeGuide && (
          <div className="border-t border-border pt-4">
            <button
              onClick={() => setGuideOpen(!guideOpen)}
              className="flex w-full items-center justify-between text-sm font-medium"
              aria-expanded={guideOpen}
            >
              Guía de medidas
              <span className="text-muted-foreground">{guideOpen ? "−" : "+"}</span>
            </button>
            {guideOpen && (
              <div className="mt-3 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {sizeGuide}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
