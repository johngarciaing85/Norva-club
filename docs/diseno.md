# Sistema de Diseno - NORVA STYLE

## Direccion visual

Premium, urbana, minimalista. Predominio blanco y negro con alto contraste. Sin color de acento llamativo; se usa un solo tono (verde WhatsApp `#25D366`) exclusivamente en el boton de compra, para que la accion principal destaque sin romper la neutralidad del diseno.

Referencia de calidad: tiendas premium streetwear (JD Sports, KITH, Fear of God). Se busca ese nivel de limpieza y jerarquia visual, sin copiar identidad.

## Tipografia

- **Display / Heading:** Oswald (Google Fonts). Fuente condensada sin serif con peso visual fuerte. Ideal para marcas urbanas: se siente industrial y directa. Se usa en el logo, titulares y nombres de seccion. Pesos: 400, 500, 600, 700.
- **Body / Sans:** Inter (Google Fonts). Sans-serif neutra con excelente legibilidad en pantalla. Gran soporte de caracteres latinos (tildes, ene). Se usa en todo el texto corrido, precios, descripciones y UI.
- Ambas se cargan via `next/font` para optimizacion automatica (font-display: swap, self-hosting).

### Justificacion

Oswald aporta la personalidad fuerte que necesita una marca streetwear sin ser decorativa. Inter es el estandar de legibilidad web y contrasta bien con Oswald sin competir. Juntas crean la dualidad "fuerte + limpio" que define la estetica de la tienda.

## Tokens

### Colores (oklch)

| Token            | Valor claro         | Uso                              |
|------------------|---------------------|----------------------------------|
| background       | oklch(1 0 0)        | Fondo principal (blanco)         |
| foreground       | oklch(0.145 0 0)    | Texto principal (casi negro)     |
| primary          | oklch(0.145 0 0)    | Botones, elementos interactivos  |
| primary-foreground | oklch(1 0 0)      | Texto sobre primary              |
| muted            | oklch(0.965 0 0)    | Fondos secundarios               |
| muted-foreground | oklch(0.48 0 0)     | Texto secundario, metadata       |
| border           | oklch(0.9 0 0)      | Bordes y separadores             |
| destructive      | oklch(0.577 0.245 27.325) | Errores, "agotado"        |

### Espaciado

Se usa la escala de Tailwind (4px base): 1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px, 12=48px, 16=64px.

### Radios

| Token     | Valor   |
|-----------|---------|
| radius    | 0.5rem  |
| radius-sm | 0.3rem  |
| radius-md | 0.4rem  |
| radius-lg | 0.5rem  |

Radios contenidos. Se evitan las esquinas muy redondeadas para mantener el tono urbano.

### Sombras

No se usan sombras prominentes. La profundidad se logra con bordes y contraste de fondo. Unica excepcion: `backdrop-blur` en el header sticky.

## Componentes base

Se usa shadcn/ui (estilo base-nova) como base de componentes. Componentes instalados: Button, Badge, Sheet, Skeleton, Separator.

## Responsive

Mobile-first. Breakpoints de Tailwind:
- Default: 375px+ (movil)
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

Grilla de productos: 2 columnas en movil, 3 en lg, 4 en xl.

## Accesibilidad

- Contraste minimo WCAG AA en todas las combinaciones texto/fondo.
- SizeSelector: tallas agotadas tienen X roja + texto tachado + `aria-disabled` + aria-label descriptivo. No depende solo del color.
- Menu movil: focus trap, cierra con Escape.
- IntroAnimation: se omite con `prefers-reduced-motion: reduce`.
