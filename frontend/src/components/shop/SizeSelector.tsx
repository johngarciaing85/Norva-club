"use client";

import { cn } from "cn";
import type { SizeVariant } from "@/types";

interface SizeSelectorProps {
  variants: SizeVariant[];
  selected: string | null;
  onSelect: (size: string) => void;
}

export function SizeSelector({ variants, selected, onSelect }: SizeSelectorProps) {
  return (
    <fieldset>
      <legend className="text-sm font-medium mb-2">Talla</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {variants.map((v) => {
          const outOfStock = v.stock === 0;
          const isSelected = selected === v.size;

          return (
            <button
              key={v.size}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={outOfStock}
              aria-label={
                outOfStock
                  ? `Talla ${v.size}, agotada`
                  : `Talla ${v.size}`
              }
              disabled={outOfStock}
              onClick={() => onSelect(v.size)}
              className={cn(
                "relative flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors",
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground",
                outOfStock &&
                  "cursor-not-allowed border-border/50 text-muted-foreground/50 line-through hover:border-border/50"
              )}
            >
              {v.size}
              {outOfStock && (
                <span className="absolute inset-0 flex items-center justify-center text-destructive text-base font-bold pointer-events-none">
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
