# NORVA STYLE

Tienda online de ropa streetwear para Colombia. Catalogo publico con compra por WhatsApp y panel de administracion privado.

## Estructura

```
norva-club/
├── frontend/          # Next.js (App Router, TypeScript, Tailwind)
├── backend/           # FastAPI + SQLAlchemy 2.x + Alembic
├── deploy/scripts/    # Scripts de despliegue
├── docs/              # Documentacion de arquitectura
├── .github/workflows/ # CI/CD
└── docker-compose.yml # PostgreSQL 16 para desarrollo (puerto 5434)
```

## Requisitos

- Node.js 20+
- Python 3.12+
- Docker y Docker Compose
- PowerShell (Windows)

## Levantar el entorno local

### 1. Copiar variables de entorno

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

### 2. Levantar PostgreSQL

```powershell
docker compose up -d
```

El contenedor expone PostgreSQL en el puerto **5434** del host (configurable con `POSTGRES_PORT` en `.env`). Verificar:

```powershell
docker compose ps
```

### 3. Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
```

#### Migraciones

```powershell
# Aplicar migraciones
alembic upgrade head

# Revertir todas las migraciones
alembic downgrade base
```

#### Seed de datos

```powershell
# Cargar tallas (idempotente, se puede correr en cualquier entorno)
python -m app.cli seed-sizes

# Cargar datos de demostración (solo en development)
python -m app.cli seed-demo
```

#### Iniciar servidor

```powershell
uvicorn app.main:app --reload
```

El backend queda en http://localhost:8000. Verificar con:

```powershell
curl http://localhost:8000/health
```

### 4. Frontend

```powershell
cd frontend
npm install
npm run dev
```

El frontend queda en http://localhost:3000.

### 5. Tests

```powershell
# Backend (requiere norva_test en PostgreSQL, creada automáticamente por docker/init-test-db.sql)
cd backend
.venv\Scripts\activate
pytest

# Frontend
cd frontend
npm test
```

## Endpoints publicos (Fase 3)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/categories` | Categorias activas |
| GET | `/products` | Productos publicados (soporta `?category=`, `?page=`, `?page_size=`) |
| GET | `/products/{slug}` | Detalle de un producto publicado |
