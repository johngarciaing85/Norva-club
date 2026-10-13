"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <Logo variant="light" className="text-lg" />
            <p className="mt-2 text-sm text-background/60 tracking-widest uppercase">
              Move Different.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-background/50 mb-3">
              Tienda
            </h3>
            <nav className="flex flex-col gap-2">
              <Link href="/catalogo" className="text-sm text-background/80 hover:text-background transition-colors">
                Catálogo
              </Link>
              <Link href="/categoria/camisetas" className="text-sm text-background/80 hover:text-background transition-colors">
                Camisetas
              </Link>
              <Link href="/categoria/pantalones" className="text-sm text-background/80 hover:text-background transition-colors">
                Pantalones
              </Link>
              <Link href="/categoria/accesorios" className="text-sm text-background/80 hover:text-background transition-colors">
                Accesorios
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-background/50 mb-3">
              Información
            </h3>
            <nav className="flex flex-col gap-2 mb-6">
              <Link href="/cambios-y-devoluciones" className="text-sm text-background/80 hover:text-background transition-colors">
                Cambios y devoluciones
              </Link>
            </nav>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-background/50 mb-3">
              Contacto
            </h3>
            <div className="flex flex-col gap-2 text-sm text-background/80">
              <p>WhatsApp: [número pendiente]</p>
              <p>Email: [correo pendiente]</p>
              <p>Bogotá, Colombia</p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-background/10" />

        <p className="text-center text-xs text-background/40">
          © 2026 NÓRVA STYLE. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
