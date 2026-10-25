import type { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description: "Conoce la historia de NÓRVA STYLE, streetwear colombiano.",
};

export default function SobreNosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-wider mb-8">
        Sobre nosotros
      </h1>

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
        <p>
          [PENDIENTE: historia de la marca, misión, visión — a definir por el
          dueño.]
        </p>
      </div>
    </div>
  );
}
