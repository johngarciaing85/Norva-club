"""Business logic for image upload, optimization, and deletion via Cloudinary."""

from app.integrations.cloudinary_client import delete_image, upload_image


def upload_product_image(file_bytes: bytes) -> dict:
    return upload_image(file_bytes, folder="norva/products")


def delete_product_image(public_id: str) -> bool:
    return delete_image(public_id)
