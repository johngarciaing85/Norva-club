"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

interface StockStepperProps {
  value: number;
  originalValue: number;
  onChange: (value: number) => void;
}

export function StockStepper({ value, originalValue, onChange }: StockStepperProps) {
  const modified = value !== originalValue;
  const isZero = value === 0;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={isZero}
        aria-label="Disminuir stock"
      >
        <Minus className="size-3.5" />
      </Button>

      <span
        className={cn(
          "w-10 text-center tabular-nums text-sm font-medium",
          modified && "text-blue-600 font-bold",
          isZero && "text-destructive"
        )}
        aria-label={`Stock: ${value}`}
      >
        {value}
      </span>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onChange(value + 1)}
        aria-label="Aumentar stock"
      >
        <Plus className="size-3.5" />
      </Button>

      {modified && (
        <span className="text-xs text-muted-foreground">
          (era {originalValue})
        </span>
      )}
    </div>
  );
}
