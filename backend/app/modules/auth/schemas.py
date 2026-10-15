"""Pydantic schemas for authentication requests and responses."""

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminUserOut(BaseModel):
    id: str
    email: str
