import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const sizeVariantSchema = z.object({
  size: z.string().min(1),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
});

export const productSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones"),
  description: z.string().min(1, "La descripción es obligatoria").max(500, "Máximo 500 caracteres"),
  price: z.number().int().positive("El precio debe ser mayor a 0"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  sizeType: z.enum(["ropa", "calzado", "unica"]),
  availability: z.enum(["inmediata", "bajo_confirmacion"]),
  gender: z.enum(["dama", "caballero", "unisex"]),
  status: z.enum(["borrador", "publicado", "archivado"]),
  variants: z.array(sizeVariantSchema).min(1, "Al menos una talla es necesaria"),
});

export type ProductFormData = z.infer<typeof productSchema>;

const salesDocLineSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  size: z.string().min(1, "Selecciona una talla"),
  quantity: z.number().int().positive("La cantidad debe ser al menos 1"),
  unitPrice: z.number().positive(),
  maxStock: z.number().int().min(0),
});

export const salesDocSchema = z
  .object({
    clientName: z.string().min(1, "El nombre del cliente es obligatorio"),
    clientEmail: z.string().email("Correo electrónico inválido"),
    date: z.string().min(1, "La fecha de emisión es obligatoria"),
    lines: z.array(salesDocLineSchema).min(1, "Agrega al menos un producto"),
  })
  .superRefine((data, ctx) => {
    data.lines.forEach((line, i) => {
      if (line.quantity > line.maxStock) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Stock insuficiente (disponible: ${line.maxStock})`,
          path: ["lines", i, "quantity"],
        });
      }
    });
  });

export type SalesDocFormData = z.infer<typeof salesDocSchema>;

export function computeTotal(lines: { quantity: number; unitPrice: number }[]): number {
  return lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
}
