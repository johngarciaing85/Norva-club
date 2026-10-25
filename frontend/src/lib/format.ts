export function formatCOP(amount: number): string {
  const formatted = new Intl.NumberFormat("es-CO", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `$${formatted}`;
}

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function isOutOfStock(variants: { stock: number }[]): boolean {
  return variants.length > 0 && variants.every((v) => v.stock === 0);
}

export function formatInventoryDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  });
}
