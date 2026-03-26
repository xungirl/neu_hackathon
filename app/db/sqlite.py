from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


class SQLiteDatabase:
    def __init__(self, db_path: str) -> None:
        self.db_path = Path(db_path)

    def initialize(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with self.connection() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS pets (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    name TEXT,
                    breed TEXT,
                    size TEXT,
                    gender TEXT,
                    age INTEGER,
                    vaccinated INTEGER DEFAULT 0,
                    neutered INTEGER DEFAULT 0,
                    personality_tags TEXT,
                    photos TEXT,
                    bio TEXT,
                    aitags TEXT,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS pet_dynamic_info (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pet_id TEXT NOT NULL,
                    activity_level REAL NOT NULL,
                    approach_speed REAL NOT NULL,
                    emotional_stability REAL NOT NULL,
                    play_preference TEXT NOT NULL,
                    body_language_score REAL NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS stray_dog_reports (
                    report_id TEXT PRIMARY KEY,
                    image_path TEXT,
                    image_base64 TEXT,
                    latitude REAL,
                    longitude REAL,
                    reported_at TEXT,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS match_notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    owner_id TEXT NOT NULL,
                    matched_report_ids TEXT NOT NULL,
                    similarity_score REAL NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT NOT NULL UNIQUE,
                    name TEXT NOT NULL,
                    hashed_password TEXT NOT NULL,
                    avatar TEXT,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
                """
            )
        self._migrate()

    def _migrate(self) -> None:
        new_cols = [
            ("user_id", "TEXT"),
            ("name", "TEXT"),
            ("breed", "TEXT"),
            ("size", "TEXT"),
            ("gender", "TEXT"),
            ("age", "INTEGER"),
            ("vaccinated", "INTEGER DEFAULT 0"),
            ("neutered", "INTEGER DEFAULT 0"),
            ("personality_tags", "TEXT"),
            ("photos", "TEXT"),
            ("bio", "TEXT"),
        ]
        with self.connection() as conn:
            for col, col_type in new_cols:
                try:
                    conn.execute(f"ALTER TABLE pets ADD COLUMN {col} {col_type}")
                except Exception:
                    pass

    @contextmanager
    def connection(self) -> Iterator[sqlite3.Connection]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
