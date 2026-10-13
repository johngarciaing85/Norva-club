import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="font-heading text-6xl font-bold">404</h1>
      <p className="mt-4 text-muted-foreground">
        La página que buscas no existe.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block border border-foreground px-6 py-2.5 text-sm font-medium uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
