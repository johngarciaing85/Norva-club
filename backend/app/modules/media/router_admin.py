"""Admin media endpoints: upload and delete product images."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from app.core.dependencies import get_current_admin
from app.modules.auth.models import AdminUser
from app.modules.media import service

router = APIRouter(prefix="/admin/media", tags=["admin-media"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/avif"}


@router.post("/upload")
async def upload_image(
    file: UploadFile,
    _admin: AdminUser = Depends(get_current_admin),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Archivo demasiado grande (máx 10 MB)")

    result = service.upload_product_image(contents)
    return result


@router.delete("/{public_id:path}")
def delete_image(
    public_id: str,
    _admin: AdminUser = Depends(get_current_admin),
):
    ok = service.delete_product_image(public_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    return {"ok": True}
