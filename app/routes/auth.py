from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request

from app.core.deps import get_current_user_id
from app.core.response import api_success
from app.core.security import create_access_token, hash_password, verify_password
from app.db.database import Database
from app.schemas.user import AuthResponse, UserLogin, UserRegister, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


def _get_db(request: Request) -> Database:
    return request.app.state.db


@router.post("/register", response_model=dict)
def register(body: UserRegister, db: Database = Depends(_get_db)):
    with db.connection() as conn:
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (body.email,)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user_id = str(uuid.uuid4())
        conn.execute(
            "INSERT INTO users (id, email, name, hashed_password) VALUES (?, ?, ?, ?)",
            (user_id, body.email, body.name, hash_password(body.password)),
        )

    token = create_access_token(user_id)
    return api_success(AuthResponse(
        token=token,
        user=UserResponse(id=user_id, email=body.email, name=body.name),
    ).model_dump())


@router.post("/login", response_model=dict)
def login(body: UserLogin, db: Database = Depends(_get_db)):
    with db.connection() as conn:
        row = conn.execute(
            "SELECT id, email, name, hashed_password, avatar FROM users WHERE email = ?",
            (body.email,),
        ).fetchone()

    if not row or not verify_password(body.password, row["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(row["id"])
    return api_success(AuthResponse(
        token=token,
        user=UserResponse(id=row["id"], email=row["email"], name=row["name"], avatar=row["avatar"]),
    ).model_dump())


@router.get("/me", response_model=dict)
def me(user_id: str = Depends(get_current_user_id), db: Database = Depends(_get_db)):
    with db.connection() as conn:
        row = conn.execute(
            "SELECT id, email, name, avatar FROM users WHERE id = ?", (user_id,)
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    return api_success(UserResponse(id=row["id"], email=row["email"], name=row["name"], avatar=row["avatar"]).model_dump())
