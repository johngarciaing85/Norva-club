"""Business logic for authentication and session management."""

import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import generate_session_token, hash_token, verify_password
from app.modules.auth.models import AdminSession, AdminUser

SESSION_LIFETIME = timedelta(hours=24)
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION = timedelta(minutes=15)


def authenticate(db: Session, email: str, password: str) -> AdminUser | None:
    user = db.scalar(select(AdminUser).where(AdminUser.email == email))
    if user is None:
        return None

    if not user.is_active:
        return None

    now = datetime.now(UTC)
    if user.locked_until and user.locked_until > now:
        return None

    if not verify_password(password, user.password_hash):
        user.failed_attempts += 1
        if user.failed_attempts >= MAX_FAILED_ATTEMPTS:
            user.locked_until = now + LOCKOUT_DURATION
        db.flush()
        return None

    user.failed_attempts = 0
    user.locked_until = None
    user.last_login_at = now
    db.flush()
    return user


def create_session(
    db: Session,
    user: AdminUser,
    ip: str | None = None,
    user_agent: str | None = None,
) -> str:
    token = generate_session_token()
    csrf = secrets.token_urlsafe(16)

    session = AdminSession(
        admin_user_id=user.id,
        token_hash=hash_token(token),
        csrf_token=csrf,
        expires_at=datetime.now(UTC) + SESSION_LIFETIME,
        ip=ip,
        user_agent=user_agent,
    )
    db.add(session)
    db.flush()
    return token


def validate_session(db: Session, token: str) -> AdminUser | None:
    token_hash = hash_token(token)
    now = datetime.now(UTC)

    stmt = (
        select(AdminSession)
        .where(
            AdminSession.token_hash == token_hash,
            AdminSession.expires_at > now,
            AdminSession.revoked_at.is_(None),
        )
    )
    session = db.scalar(stmt)
    if session is None:
        return None

    user = session.admin_user
    if not user.is_active:
        return None

    return user


def revoke_session(db: Session, token: str) -> None:
    token_hash = hash_token(token)
    session = db.scalar(
        select(AdminSession).where(AdminSession.token_hash == token_hash)
    )
    if session and session.revoked_at is None:
        session.revoked_at = datetime.now(UTC)
        db.flush()
