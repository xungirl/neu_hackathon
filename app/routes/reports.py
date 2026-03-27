from __future__ import annotations

import uuid
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.core.deps import get_current_user_id
from app.core.response import api_success
from app.db.database import Database

router = APIRouter(prefix="/reports", tags=["reports"])


def _get_db(request: Request) -> Database:
    return request.app.state.db


def initialize_reports_table(db: Database) -> None:
    """Create the reports table if it doesn't exist."""
    schema = """
        CREATE TABLE IF NOT EXISTS reports (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            lat REAL,
            lng REAL,
            type TEXT NOT NULL,
            pet_name TEXT,
            description TEXT,
            color TEXT,
            size TEXT,
            photo_url TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    """
    if db._is_pg:
        with db.connection() as conn:
            conn.executescript(schema)
    else:
        sqlite_schema = schema.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
        sqlite_schema = sqlite_schema.replace("TIMESTAMP", "TEXT")
        with db.connection() as conn:
            conn.executescript(sqlite_schema)


class ReportCreate(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    type: str  # "lost" or "stray"
    pet_name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    size: Optional[str] = None
    photo_url: Optional[str] = None


def _row_to_dict(row: Any) -> dict[str, Any]:
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "lat": row["lat"],
        "lng": row["lng"],
        "type": row["type"],
        "pet_name": row["pet_name"],
        "description": row["description"],
        "color": row["color"],
        "size": row["size"],
        "photo_url": row["photo_url"],
        "created_at": row["created_at"],
    }


@router.get("")
def list_reports(
    limit: int = 50,
    offset: int = 0,
    db: Database = Depends(_get_db),
) -> dict[str, Any]:
    with db.connection() as conn:
        rows = conn.execute(
            "SELECT * FROM reports ORDER BY created_at DESC LIMIT ? OFFSET ?",
            (limit, offset),
        ).fetchall()
        count_row = conn.execute(
            "SELECT COUNT(*) AS cnt FROM reports"
        ).fetchone()
        total = count_row["cnt"] if isinstance(count_row, dict) else count_row[0]
    items = [_row_to_dict(r) for r in rows]
    return api_success({"items": items, "total": total, "limit": limit, "offset": offset})


@router.post("")
def create_report(
    body: ReportCreate,
    user_id: str = Depends(get_current_user_id),
    db: Database = Depends(_get_db),
) -> dict[str, Any]:
    if body.type not in ("lost", "stray"):
        raise HTTPException(status_code=400, detail="type must be 'lost' or 'stray'")
    with db.connection() as conn:
        conn.execute(
            """
            INSERT INTO reports (user_id, lat, lng, type, pet_name, description, color, size, photo_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                body.lat,
                body.lng,
                body.type,
                body.pet_name,
                body.description,
                body.color,
                body.size,
                body.photo_url,
            ),
        )
    # Fetch the newly created report
    with db.connection() as conn:
        row = conn.execute(
            "SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
            (user_id,),
        ).fetchone()
    return api_success(_row_to_dict(row))
