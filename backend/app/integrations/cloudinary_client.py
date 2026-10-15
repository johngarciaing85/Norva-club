"""Cloudinary SDK wrapper for image upload and management."""

import cloudinary
import cloudinary.api
import cloudinary.uploader

from app.core.config import settings

_configured = False


def _ensure_configured() -> None:
    global _configured
    if _configured:
        return
    if not settings.CLOUDINARY_URL:
        raise RuntimeError("CLOUDINARY_URL no configurada")
    cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)
    _configured = True


def upload_image(file_bytes: bytes, folder: str = "norva") -> dict:
    _ensure_configured()
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=folder,
        resource_type="image",
        transformation=[{"quality": "auto", "fetch_format": "auto"}],
    )
    return {
        "url": result["secure_url"],
        "publicId": result["public_id"],
    }


def delete_image(public_id: str) -> bool:
    _ensure_configured()
    result = cloudinary.uploader.destroy(public_id, resource_type="image")
    return result.get("result") == "ok"
