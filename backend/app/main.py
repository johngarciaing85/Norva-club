from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import register_error_handlers
from app.modules.catalog.router_public import router as catalog_router

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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
