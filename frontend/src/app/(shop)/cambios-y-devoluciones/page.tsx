import type { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
  title: "Cambios y devoluciones",
  description: "Política de cambios y devoluciones de NÓRVA STYLE.",
};

export default function CambiosYDevolucionesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-heading text-2xl font-bold uppercase tracking-wider mb-8">
        Cambios y devoluciones
      </h1>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Cambios
          </h2>
          <p>
            [PENDIENTE: definir por el dueño — incluir plazo máximo para
            solicitar un cambio, condiciones del producto (etiquetas, sin uso,
            empaque original), tallas o productos excluidos, y quién asume el
            costo del envío de devolución.]
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Devoluciones y reembolsos
          </h2>
          <p>
            [PENDIENTE: definir por el dueño — incluir plazo máximo para
            solicitar una devolución, método de reembolso (transferencia,
            crédito en tienda, etc.), tiempo estimado de procesamiento, y
            condiciones para aceptar la devolución.]
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Productos defectuosos
          </h2>
          <p>
            [PENDIENTE: definir por el dueño — incluir procedimiento para
            reportar un producto defectuoso, evidencia requerida (fotos, video),
            plazo para reportar, y si el envío de devolución corre por cuenta de
            la tienda.]
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Proceso para solicitar un cambio o devolución
          </h2>
          <p>
            [PENDIENTE: definir por el dueño — incluir canal de contacto
            (WhatsApp, correo), datos que debe proporcionar el cliente (número de
            pedido, fotos), y pasos del proceso.]
          </p>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-base font-semibold text-foreground mb-3">
            Derecho de retracto (Ley 1480 de 2011)
          </h2>
          <p>
            De acuerdo con la legislación colombiana de protección al consumidor
            (Ley 1480 de 2011, Estatuto del Consumidor), en las ventas realizadas
            a distancia (incluidas las ventas por medios electrónicos y
            telefónicos), el consumidor tiene derecho a retractarse de la compra
            dentro de los cinco (5) días hábiles siguientes a la entrega del
            producto, siempre que este se devuelva en las mismas condiciones en
            que fue recibido.
          </p>
          <p className="mt-3">
            [PENDIENTE: definir por el dueño — revisar con asesoría legal para
            confirmar los términos específicos aplicables a este negocio,
            incluyendo procedimiento interno de retracto, excepciones si aplican,
            y tiempos de reembolso.]
          </p>
        </section>
      </div>
    </div>
  );
}
