"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { adminProducts, mockAction } from "@/lib/admin-mock-data";
import { formatCOP, formatDate } from "@/lib/format";
import { salesDocSchema, type SalesDocFormData, computeTotal } from "@/lib/validation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass =
  "flex h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const publishedProducts = adminProducts.filter((p) => p.status === "publicado");

export default function NuevoComprobantePage() {
  const router = useRouter();
  const [pendingData, setPendingData] = useState<SalesDocFormData | null>(null);
  const [sending, setSending] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SalesDocFormData>({
    resolver: zodResolver(salesDocSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      date: "",
      lines: [],
    },
  });

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    setValue("date", `${y}-${m}-${d}`);
  }, [setValue]);

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  const watchedLines = watch("lines");
  const total = computeTotal(watchedLines ?? []);

  function addLine() {
    append({
      productId: "",
      productName: "",
      size: "",
      quantity: 1,
      unitPrice: 0,
      maxStock: 0,
    });
  }

  function handleProductChange(index: number, productId: string) {
    const product = publishedProducts.find((p) => p.id === productId);
    if (!product) return;
    setValue(`lines.${index}.productId`, productId);
    setValue(`lines.${index}.productName`, product.name);
    setValue(`lines.${index}.unitPrice`, product.price);
    setValue(`lines.${index}.size`, "");
    setValue(`lines.${index}.quantity`, 1);
    setValue(`lines.${index}.maxStock`, 0);
  }

  function handleSizeChange(index: number, size: string) {
    const productId = getValues(`lines.${index}.productId`);
    const product = publishedProducts.find((p) => p.id === productId);
    const variant = product?.variants.find((v) => v.size === size);
    const stock = variant?.stock ?? 0;
    setValue(`lines.${index}.size`, size);
    setValue(`lines.${index}.maxStock`, stock);
    if (getValues(`lines.${index}.quantity`) > stock) {
      setValue(`lines.${index}.quantity`, Math.max(1, stock));
    }
  }

  function onValidSubmit(data: SalesDocFormData) {
    setPendingData(data);
  }

  async function handleConfirm() {
    setSending(true);
    try {
      // TODO(Fase 6): replace with real API call to create sales doc + discount stock
      await mockAction(1200);
      toast.success("Comprobante enviado correctamente");
      router.push("/admin/comprobantes");
    } catch {
      toast.error("Error al enviar el comprobante");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6 p-4 pb-20 md:p-6 md:pb-6">
      <h1 className="font-heading text-xl font-bold">Nuevo comprobante de venta</h1>

      <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nombre del cliente</Label>
            <Input id="clientName" {...register("clientName")} />
            {errors.clientName && (
              <p className="text-xs text-destructive">{errors.clientName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Correo electrónico</Label>
            <Input
              id="clientEmail"
              type="email"
              placeholder="cliente@example.com"
              {...register("clientEmail")}
            />
            {errors.clientEmail && (
              <p className="text-xs text-destructive">{errors.clientEmail.message}</p>
            )}
          </div>
        </div>

        <div className="max-w-xs space-y-2">
          <Label htmlFor="date">Fecha de emisión</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Productos</Label>
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="size-4" data-icon="inline-start" />
              Agregar línea
            </Button>
          </div>

          {errors.lines?.message && (
            <p className="text-xs text-destructive">{errors.lines.message}</p>
          )}
          {errors.lines?.root?.message && (
            <p className="text-xs text-destructive">{errors.lines.root.message}</p>
          )}

          {fields.map((field, i) => {
            const productId = watchedLines?.[i]?.productId;
            const product = publishedProducts.find((p) => p.id === productId);
            const availableVariants =
              product?.variants.filter((v) => v.stock > 0) ?? [];
            const lineErrors = errors.lines?.[i];

            return (
              <div key={field.id} className="space-y-3 rounded-lg border p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <select
                      value={watchedLines?.[i]?.productId ?? ""}
                      onChange={(e) => handleProductChange(i, e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Seleccionar producto…</option>
                      {publishedProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatCOP(p.price)}
                        </option>
                      ))}
                    </select>
                    {lineErrors?.productId && (
                      <p className="text-xs text-destructive">
                        {lineErrors.productId.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(i)}
                    aria-label="Eliminar línea"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>

                {product && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Talla</span>
                      <select
                        value={watchedLines?.[i]?.size ?? ""}
                        onChange={(e) => handleSizeChange(i, e.target.value)}
                        className={selectClass}
                      >
                        <option value="">Talla…</option>
                        {availableVariants.map((v) => (
                          <option key={v.size} value={v.size}>
                            {v.size} (stock: {v.stock})
                          </option>
                        ))}
                      </select>
                      {lineErrors?.size && (
                        <p className="text-xs text-destructive">
                          {lineErrors.size.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Cantidad</span>
                      <Input
                        type="number"
                        min={1}
                        {...register(`lines.${i}.quantity`, { valueAsNumber: true })}
                        className="tabular-nums"
                      />
                      {lineErrors?.quantity && (
                        <p className="text-xs text-destructive">
                          {lineErrors.quantity.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Subtotal</span>
                      <p className="flex h-8 items-center text-sm font-medium tabular-nums">
                        {formatCOP(
                          (watchedLines?.[i]?.quantity ?? 0) *
                            (watchedLines?.[i]?.unitPrice ?? 0)
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {fields.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border bg-card p-4">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-bold tabular-nums">{formatCOP(total)}</span>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={sending}>
            {sending ? "Enviando…" : "Enviar comprobante"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/comprobantes")}
          >
            Cancelar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Este es un comprobante informativo de venta. No reemplaza la factura electrónica.
        </p>
      </form>

      <ConfirmDialog
        open={!!pendingData}
        onOpenChange={(open) => {
          if (!open) setPendingData(null);
        }}
        title="Confirmar envío de comprobante"
        confirmLabel="Enviar"
        onConfirm={handleConfirm}
        loading={sending}
      >
        {pendingData && (
          <div className="space-y-3 text-sm">
            <div>
              <p>
                <span className="text-muted-foreground">Cliente:</span>{" "}
                {pendingData.clientName}
              </p>
              <p>
                <span className="text-muted-foreground">Correo:</span>{" "}
                {pendingData.clientEmail}
              </p>
              <p>
                <span className="text-muted-foreground">Fecha:</span>{" "}
                {formatDate(pendingData.date)}
              </p>
            </div>
            <div className="space-y-1 border-t pt-2">
              {pendingData.lines.map((line, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {line.quantity}x {line.productName} ({line.size})
                  </span>
                  <span className="tabular-nums">
                    {formatCOP(line.quantity * line.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCOP(computeTotal(pendingData.lines))}
              </span>
            </div>
            <p className="text-muted-foreground">
              ¿Estás seguro de que deseas enviar este documento al correo indicado?
            </p>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
