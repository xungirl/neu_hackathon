from __future__ import annotations

from fastapi import Depends, HTTPException, Request

from app.core.security import decode_access_token


def get_current_user_id(request: Request) -> str:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = auth_header[len("Bearer "):]
    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token expired or invalid")
    return user_id
