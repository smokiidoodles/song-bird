from __future__ import annotations

from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from supabase import Client, create_client

from app.config import settings

supabase_admin: Client = create_client(
    settings.supabase_url,
    settings.supabase_secret_key,
)


def get_bearer_token(
    authorization: Optional[str] = Header(default=None),
) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header.",
        )

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization must use Bearer token format.",
        )

    return token


def get_current_user_id(
    token: str = Depends(get_bearer_token),
) -> str:
    try:
        response = supabase_admin.auth.get_user(token)
        user = response.user

        if not user:
            raise ValueError("No authenticated user found.")

        return user.id
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Supabase session.",
        ) from error