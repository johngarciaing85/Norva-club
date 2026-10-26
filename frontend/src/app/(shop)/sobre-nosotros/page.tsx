import type { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "Conoce la historia, misión y visión de NÓRVA STYLE, streetwear nacido en Medellín, Colombia.",
};

export default function SobreNosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-wider mb-8">
        Sobre nosotros
      </h1>

      <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Nuestra historia
          </h2>
          <p>
            NÓRVA STYLE nace en las calles de Medellín, Colombia — una ciudad
            que respira creatividad, cultura urbana y emprendimiento. Desde el
            corazón del Valle de Aburrá, creamos prendas streetwear que reflejan
            la energía y la identidad de quienes se atreven a moverse diferente.
          </p>
          <p className="mt-3">
            Lo que empezó como una idea entre amigos apasionados por la moda
            urbana se convirtió en una marca con propósito: llevar el estilo
            callejero colombiano a otro nivel, con diseños auténticos y calidad
            que se siente desde la primera puesta.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Misión
          </h2>
          <p>
            Diseñar y ofrecer ropa streetwear de alta calidad que permita a
            cada persona expresar su identidad y estilo único. Nos comprometemos
            a crear prendas con diseños originales, materiales duraderos y un
            proceso de compra cercano y personalizado a través de nuestros
            canales directos.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Visión
          </h2>
          <p>
            Ser la marca de streetwear colombiano referente en Latinoamérica,
            reconocida por su autenticidad, innovación en diseño y conexión
            real con la cultura urbana. Queremos que NÓRVA STYLE sea sinónimo
            de actitud, calidad y orgullo por lo hecho en Colombia.
          </p>
        </section>

        <section className="rounded-lg border border-border p-6">
          <p className="text-center text-foreground font-medium italic">
            &ldquo;Move Different.&rdquo;
          </p>
          <p className="text-center mt-2 text-xs">
            Medellín, Colombia 🇨🇴
          </p>
        </section>
      </div>
    </div>
  );
}
