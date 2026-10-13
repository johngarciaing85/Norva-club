import { Badge } from "@/components/ui/badge";
import { formatInventoryDate } from "@/lib/format";
import type { Availability } from "@/types";

interface AvailabilityBadgeProps {
  availability: Availability;
  inventoryUpdatedAt: string | null;
}

export function AvailabilityBadge({ availability, inventoryUpdatedAt }: AvailabilityBadgeProps) {
  const label =
    availability === "inmediata" ? "Entrega inmediata" : "Bajo confirmación";

  return (
    <div className="space-y-1">
      <Badge
        variant={availability === "inmediata" ? "default" : "secondary"}
        className="text-xs"
      >
        {label}
      </Badge>
      {inventoryUpdatedAt && (
        <p className="text-xs text-muted-foreground">
          Inventario actualizado el {formatInventoryDate(inventoryUpdatedAt)}
        </p>
      )}
    </div>
  );
}
