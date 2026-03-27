from __future__ import annotations

import json
import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.core.deps import get_current_user_id
from app.core.response import api_success
from app.db.database import Database

router = APIRouter(prefix="/pets", tags=["pets"])


def _get_db(request: Request) -> Database:
    return request.app.state.db


class PetCreate(BaseModel):
    name: str
    breed: str
    size: Optional[str] = "medium"
    gender: Optional[str] = "Male"
    age: Optional[int] = 1
    vaccinated: Optional[bool] = False
    neutered: Optional[bool] = False
    personality_tags: Optional[list[str]] = []
    photos: Optional[list[str]] = []
    bio: Optional[str] = ""


def _row_to_dict(row: Any) -> dict[str, Any]:
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "name": row["name"],
        "breed": row["breed"],
        "size": row["size"],
        "gender": row["gender"],
        "age": row["age"],
        "vaccinated": bool(row["vaccinated"]),
        "neutered": bool(row["neutered"]),
        "personality_tags": json.loads(row["personality_tags"] or "[]"),
        "photos": json.loads(row["photos"] or "[]"),
        "bio": row["bio"],
        "created_at": row["created_at"],
    }


@router.get("")
def list_pets(
    limit: int = 50,
    offset: int = 0,
    db: Database = Depends(_get_db),
) -> dict[str, Any]:
    with db.connection() as conn:
        rows = conn.execute(
            "SELECT * FROM pets WHERE name IS NOT NULL ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        ).fetchall()
        count_row = conn.execute(
            "SELECT COUNT(*) AS cnt FROM pets WHERE name IS NOT NULL"
        ).fetchone()
        total = count_row["cnt"] if isinstance(count_row, dict) else count_row[0]
    items = [_row_to_dict(r) for r in rows]
    return api_success({"items": items, "total": total, "limit": limit, "offset": offset})


@router.get("/{pet_id}")
def get_pet(pet_id: str, db: Database = Depends(_get_db)) -> dict[str, Any]:
    with db.connection() as conn:
        row = conn.execute("SELECT * FROM pets WHERE id = ?", (pet_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Pet not found")
    return api_success(_row_to_dict(row))


@router.post("")
def create_pet(
    body: PetCreate,
    user_id: str = Depends(get_current_user_id),
    db: Database = Depends(_get_db),
) -> dict[str, Any]:
    pet_id = str(uuid.uuid4())
    with db.connection() as conn:
        conn.execute(
            """
            INSERT INTO pets (id, user_id, name, breed, size, gender, age,
                vaccinated, neutered, personality_tags, photos, bio)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                pet_id,
                user_id,
                body.name,
                body.breed,
                body.size,
                body.gender,
                body.age,
                int(body.vaccinated or False),
                int(body.neutered or False),
                json.dumps(body.personality_tags or []),
                json.dumps(body.photos or []),
                body.bio,
            ),
        )
    with db.connection() as conn:
        row = conn.execute("SELECT * FROM pets WHERE id = ?", (pet_id,)).fetchone()
    return api_success(_row_to_dict(row))
