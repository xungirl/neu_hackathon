from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator


class _CursorWrapper:
    """Wraps a DB cursor to provide a unified interface for SQLite and PostgreSQL."""

    def __init__(self, cursor: Any, is_pg: bool) -> None:
        self._cur = cursor
        self._is_pg = is_pg

    def execute(self, sql: str, params: tuple = ()) -> _CursorWrapper:
        if self._is_pg:
            sql = sql.replace("?", "%s")
        self._cur.execute(sql, params)
        return self

    def fetchone(self) -> Any:
        return self._cur.fetchone()

    def fetchall(self) -> list[Any]:
        return self._cur.fetchall()


class _ConnectionWrapper:
    """Wraps a DB connection to provide a unified interface."""

    def __init__(self, conn: Any, is_pg: bool) -> None:
        self._conn = conn
        self._is_pg = is_pg

    def execute(self, sql: str, params: tuple = ()) -> _CursorWrapper:
        if self._is_pg:
            sql = sql.replace("?", "%s")
        cur = self._conn.cursor()
        cur.execute(sql, params)
        return _CursorWrapper(cur, self._is_pg)

    def executescript(self, sql: str) -> None:
        if self._is_pg:
            self._conn.cursor().execute(sql)
        else:
            self._conn.executescript(sql)


class Database:
    def __init__(self, database_url: str | None = None, sqlite_path: str = "data/goodle.db") -> None:
        self._database_url = database_url
        self._sqlite_path = sqlite_path
        self._is_pg = database_url is not None and database_url.startswith("postgres")

    def initialize(self) -> None:
        schema = """
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
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS pet_dynamic_info (
                id SERIAL PRIMARY KEY,
                pet_id TEXT NOT NULL,
                activity_level REAL NOT NULL,
                approach_speed REAL NOT NULL,
                emotional_stability REAL NOT NULL,
                play_preference TEXT NOT NULL,
                body_language_score REAL NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS stray_dog_reports (
                report_id TEXT PRIMARY KEY,
                image_path TEXT,
                image_base64 TEXT,
                latitude REAL,
                longitude REAL,
                reported_at TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS match_notifications (
                id SERIAL PRIMARY KEY,
                owner_id TEXT NOT NULL,
                matched_report_ids TEXT NOT NULL,
                similarity_score REAL NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                hashed_password TEXT NOT NULL,
                avatar TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """

        if self._is_pg:
            # PostgreSQL: SERIAL works, execute all at once
            with self.connection() as conn:
                conn.executescript(schema)
        else:
            # SQLite: replace SERIAL with INTEGER AUTOINCREMENT
            sqlite_schema = schema.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
            sqlite_schema = sqlite_schema.replace("TIMESTAMP", "TEXT")
            Path(self._sqlite_path).parent.mkdir(parents=True, exist_ok=True)
            with self.connection() as conn:
                conn.executescript(sqlite_schema)
        self._migrate_pets()

    def _migrate_pets(self) -> None:
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
        for col, col_type in new_cols:
            try:
                with self.connection() as conn:
                    conn.execute(f"ALTER TABLE pets ADD COLUMN {col} {col_type}")
            except Exception:
                pass

    @contextmanager
    def connection(self) -> Iterator[_ConnectionWrapper]:
        if self._is_pg:
            import psycopg2
            import psycopg2.extras
            conn = psycopg2.connect(self._database_url, cursor_factory=psycopg2.extras.RealDictCursor)
            try:
                yield _ConnectionWrapper(conn, is_pg=True)
                conn.commit()
            except Exception:
                conn.rollback()
                raise
            finally:
                conn.close()
        else:
            conn = sqlite3.connect(self._sqlite_path)
            conn.row_factory = sqlite3.Row
            try:
                yield _ConnectionWrapper(conn, is_pg=False)
                conn.commit()
            except Exception:
                conn.rollback()
                raise
            finally:
                conn.close()
