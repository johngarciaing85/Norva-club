"""Shared FastAPI dependencies (current user, permissions, etc.)."""

from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.models import AdminUser
from app.modules.auth.service import validate_session


def get_current_admin(
    session_token: str | None = Cookie(None),
    db: Session = Depends(get_db),
) -> AdminUser:
    if not session_token:
        raise HTTPException(status_code=401, detail="No autenticado")

    user = validate_session(db, session_token)
    if user is None:
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")

    return user
