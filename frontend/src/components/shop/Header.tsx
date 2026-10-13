"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Logo } from "@/components/brand/Logo";
import { categories } from "@/lib/mock-data";

export function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !menuRef.current) return;

      const focusable = menuRef.current.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const firstLink = menuRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo className="text-lg sm:text-xl" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/catalogo"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Catálogo
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <button
          ref={toggleRef}
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          <span
            className={`block h-0.5 w-5 bg-foreground transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-5 bg-foreground transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 top-14 z-30 bg-black/40 md:hidden"
            onClick={close}
            aria-hidden="true"
          />
          <nav
            ref={menuRef}
            role="dialog"
            aria-label="Menú de navegación"
            className="fixed left-0 right-0 top-14 z-40 border-b border-border bg-background p-4 md:hidden"
          >
            <div className="flex flex-col gap-1">
              <Link
                href="/catalogo"
                onClick={close}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                Catálogo
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  onClick={close}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
