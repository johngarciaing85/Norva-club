import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { Availability } from "@/types";

interface AvailabilityBadgeProps {
  availability: Availability;
  updatedAt: string;
}

export function AvailabilityBadge({ availability, updatedAt }: AvailabilityBadgeProps) {
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
      <p className="text-xs text-muted-foreground">
        Inventario actualizado el {formatDate(updatedAt)}
      </p>
    </div>
  );
}
