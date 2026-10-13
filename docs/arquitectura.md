# Arquitectura

## Vista general

```
Browser ──> Next.js (frontend) ──> FastAPI (backend) ──> PostgreSQL 16
                                        │
                                        ├──> Cloudinary (imagenes)
                                        └──> Resend (emails)
```

## Frontend (Next.js)

- **Tienda publica** (`/(shop)/`): catalogo, categorias, detalle de producto. Sin autenticacion.
- **Panel admin** (`/(admin)/admin/`): gestion de productos, inventario y comprobantes de venta.
- La proteccion de rutas admin se valida contra el backend, no con logica solo en el frontend.

## Backend (FastAPI)

- Estructura modular: cada dominio (auth, catalog, inventory, sales_docs, media, audit) tiene su propio directorio con models, schemas, service y router.
- `core/` contiene configuracion, conexion a BD, seguridad, dependencias compartidas, manejo de errores y rate limiting.
- `integrations/` contiene los clientes para servicios externos (Cloudinary, Resend).
- SQLAlchemy 2.x en modo sincrono con PostgreSQL via psycopg.
- Migraciones con Alembic.

## Base de datos

- PostgreSQL 16 en desarrollo local via Docker Compose.
- Credenciales en `.env` (nunca en el repositorio).

## Flujo de compra

El catalogo es publico. Para comprar, el cliente abre un enlace de WhatsApp pre-armado con los datos del producto. No hay pagos en linea.

## Seguridad

- CORS restrictivo: solo el origen del frontend.
- Rate limiting con slowapi.
- Passwords hasheados con Argon2 (pwdlib).
- El panel admin se protege con autenticacion basada en sesiones, validada en el backend.
