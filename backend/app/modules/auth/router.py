"""Auth endpoints: login, logout, session validation."""

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_admin
from app.core.rate_limit import limiter
from app.modules.auth.models import AdminUser
from app.modules.auth.schemas import AdminUserOut, LoginRequest
from app.modules.auth.service import authenticate, create_session, revoke_session

router = APIRouter(prefix="/admin/auth", tags=["auth"])

_COOKIE_OPTS: dict = {
    "key": "session_token",
    "httponly": True,
    "samesite": "lax",
    "max_age": 86400,
    "path": "/",
}


def _cookie_opts() -> dict:
    opts = dict(_COOKIE_OPTS)
    if settings.ENVIRONMENT == "production":
        opts["secure"] = True
    return opts


@router.post("/login")
@limiter.limit("5/minute")
def login(body: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    user = authenticate(db, body.email, body.password)
    if user is None:
        db.commit()
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    token = create_session(
        db,
        user,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.commit()

    response.set_cookie(value=token, **_cookie_opts())
    return {"user": AdminUserOut(id=str(user.id), email=user.email)}


@router.post("/logout")
def logout(
    response: Response,
    session_token: str | None = Cookie(None),
    _admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if session_token:
        revoke_session(db, session_token)
    db.commit()
    response.delete_cookie(**{k: v for k, v in _COOKIE_OPTS.items() if k != "max_age"})
    return {"ok": True}


@router.get("/me")
def me(admin: AdminUser = Depends(get_current_admin)):
    return {"user": AdminUserOut(id=str(admin.id), email=admin.email)}
