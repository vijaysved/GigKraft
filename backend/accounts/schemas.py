from typing import Optional

from ninja import Schema
from pydantic import EmailStr, field_validator

from accounts.models import User

ROLES = [c[0] for c in User.Role.choices]


class RegisterIn(Schema):
    email: str
    password: str
    role: str = User.Role.NODE_MANAGER
    first_name: str = ""
    last_name: str = ""
    node_id: Optional[str] = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, value):
        if value not in ROLES:
            raise ValueError(f"role must be one of {ROLES}")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if len(value) < 8:
            raise ValueError("password must be at least 8 characters")
        return value


class LoginIn(Schema):
    email: str  # intentionally loose — DB lookup, not format enforcement
    password: str


class RefreshIn(Schema):
    refresh: str


class OTPRequestIn(Schema):
    phone: str


class OTPVerifyIn(Schema):
    phone: str
    code: str
    role: str = User.Role.HOMEOWNER

    @field_validator("role")
    @classmethod
    def validate_role(cls, value):
        if value not in (User.Role.PRO, User.Role.HOMEOWNER):
            raise ValueError("OTP login is only for pro or homeowner roles")
        return value


class GoogleAuthIn(Schema):
    id_token: str
    role: str = User.Role.MEMBER

    @field_validator("role")
    @classmethod
    def validate_role(cls, value):
        if value not in (User.Role.MEMBER, User.Role.PRO, User.Role.HOMEOWNER):
            raise ValueError("Google sign-in role must be member, pro, or homeowner")
        return value


class UserOut(Schema):
    id: int
    email: Optional[str]
    phone: Optional[str]
    role: str
    extra_roles: list[str] = []
    first_name: str
    last_name: str
    theme: str = ""
    node_id: Optional[str] = None

    @staticmethod
    def resolve_node_id(obj):
        return obj.node.node_id if obj.node_id else None


class TokenPairOut(Schema):
    access: str
    refresh: str
    user: UserOut
    created: bool = False


class AccessTokenOut(Schema):
    access: str


class OTPRequestOut(Schema):
    sent: bool
    mock: bool
    # Only populated in mock mode so local clients can complete the flow.
    dev_code: Optional[str] = None


class ErrorOut(Schema):
    detail: str
