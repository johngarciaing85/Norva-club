from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import register_error_handlers
from app.modules.auth.router import router as auth_router
from app.modules.catalog.router_admin import router as catalog_admin_router
from app.modules.catalog.router_public import router as catalog_router
from app.modules.media.router_admin import router as media_admin_router

app = FastAPI(title="NORVA STYLE API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

register_error_handlers(app)
app.include_router(catalog_router)
app.include_router(auth_router)
app.include_router(catalog_admin_router)
app.include_router(media_admin_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
