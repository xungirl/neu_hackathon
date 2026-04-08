from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from app.core.response import api_success
from app.db.database import Database

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM_PROMPT = """You are Goodle's friendly AI assistant. Goodle is a pet adoption and lost & found platform.

Platform features:
- Adoption Square: Browse pets available for adoption, filter by breed/age/size
- Pet Matching: Swipe-style matching to find compatible pets
- Lost & Found: Map-based reporting and searching for lost/stray pets with AI photo matching
- Post a Pet: Users can post pets for adoption with AI-assisted photo/video analysis
- AI Analysis: Upload a photo to instantly detect breed, age, size, and personality

When users ask about available pets, use the pet database context provided.
Be friendly, concise, and helpful. If recommending pets, mention their name, breed, age, and personality.
Always respond in the same language the user uses.
"""


def _get_db(request: Request) -> Database:
    return request.app.state.db


def _fetch_pets_context(db: Database, query: str) -> str:
    """Fetch relevant pets from DB and format as context string."""
    with db.connection() as conn:
        rows = conn.execute(
            "SELECT name, breed, size, gender, age, personality_tags, bio FROM pets WHERE name IS NOT NULL ORDER BY created_at DESC LIMIT 20"
        ).fetchall()

    if not rows:
        return "No pets currently available in the database."

    lines = ["Available pets for adoption:"]
    for r in rows:
        tags = json.loads(r["personality_tags"] or "[]")
        tag_str = ", ".join(tags) if tags else "no tags"
        lines.append(
            f"- {r['name']} | {r['breed']} | {r['size']} | {r['gender']} | Age: {r['age']} | Personality: {tag_str} | Bio: {r['bio'] or 'N/A'}"
        )
    return "\n".join(lines)


class ChatRequest(BaseModel):
    message: str


@router.post("/ask")
def ask(body: ChatRequest, request: Request) -> dict[str, Any]:
    ai_client = request.app.state.ai_client
    db = request.app.state.db

    pets_context = _fetch_pets_context(db, body.message)

    prompt = f"""{SYSTEM_PROMPT}

--- Pet Database ---
{pets_context}
--- End of Pet Database ---

User: {body.message}

Respond as a friendly assistant. Return a JSON object with a single key "reply" containing your response as a plain string (no markdown, no extra keys).
Example: {{"reply": "Here are some pets I found..."}}"""

    result = ai_client.generate_json(prompt, temperature=0.7, max_output_tokens=512)
    reply = result.get("reply", "Sorry, I could not generate a response.")
    return api_success({"reply": reply})
