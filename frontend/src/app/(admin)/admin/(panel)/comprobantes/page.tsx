"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { salesDocs } from "@/lib/admin-mock-data";
import { formatCOP, formatDate } from "@/lib/format";
import { SalesDocStatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ComprobantesPage() {
  return (
    <div className="space-y-4 p-4 pb-20 md:p-6 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold">Comprobantes de venta</h1>
        <Link href="/admin/comprobantes/nuevo">
          <Button size="sm">
            <Plus className="size-4" data-icon="inline-start" />
            Nuevo
          </Button>
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesDocs.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-mono text-xs">{doc.number}</TableCell>
                <TableCell>{doc.clientName}</TableCell>
                <TableCell>{formatDate(doc.date)}</TableCell>
                <TableCell className="tabular-nums">{formatCOP(doc.total)}</TableCell>
                <TableCell>
                  <SalesDocStatusBadge status={doc.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {salesDocs.map((doc) => (
          <div
            key={doc.id}
            className="rounded-lg border bg-card p-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{doc.number}</p>
                <p className="font-medium">{doc.clientName}</p>
                <p className="text-sm text-muted-foreground">{formatDate(doc.date)}</p>
              </div>
              <SalesDocStatusBadge status={doc.status} />
            </div>
            <p className="mt-2 text-sm font-semibold tabular-nums">{formatCOP(doc.total)}</p>
            <div className="mt-2 space-y-0.5">
              {doc.lines.map((line, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  {line.quantity}x {line.productName} ({line.size})
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Este es un comprobante informativo de venta. No reemplaza la factura electrónica.
      </p>
    </div>
  );
}
