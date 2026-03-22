import json
import base64
import tempfile
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from google import genai
from google.genai import types
from ..core.config import settings
from ..schemas import ApiResponse

router = APIRouter(prefix="/ai", tags=["ai"])


def _get_client():
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def _parse_json_response(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    return json.loads(text)


@router.post("/analyze-photo/upload")
async def analyze_photo_upload(
    pet_id: str = Form(...),
    photo: UploadFile = File(...),
):
    client = _get_client()
    image_bytes = await photo.read()

    prompt = """You are a pet expert. Analyze this pet photo and return ONLY a JSON object with exactly these fields:
{
  "breed": "<breed name or 'Mixed Breed'>",
  "size": "<small|medium|large>",
  "age_group": "<puppy|adult|senior>",
  "appearance_tags": ["<tag1>", "<tag2>", "<tag3>"],
  "personality_guess": "<one personality trait like Playful, Calm, Energetic, etc.>"
}
Return ONLY the JSON. No explanation."""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=[
            prompt,
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=photo.content_type or "image/jpeg"
            )
        ]
    )

    try:
        result = _parse_json_response(response.text)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")

    return ApiResponse.success(data=result)


@router.post("/analyze-video/upload")
async def analyze_video_upload(
    pet_id: str = Form(...),
    video: UploadFile = File(...),
    preprocess_seconds: int = Form(10),
):
    client = _get_client()
    video_bytes = await video.read()

    suffix = os.path.splitext(video.filename or "video.mp4")[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(video_bytes)
        tmp_path = tmp.name

    try:
        uploaded = client.files.upload(
            file=tmp_path,
            config=types.UploadFileConfig(mime_type=video.content_type or "video/mp4")
        )

        import time
        for _ in range(20):
            file_info = client.files.get(name=uploaded.name)
            if file_info.state.name == "ACTIVE":
                break
            time.sleep(2)
        else:
            raise HTTPException(status_code=500, detail="Video processing timed out")

        prompt = """You are a pet behavior expert. Analyze this pet video and return ONLY a JSON object with exactly these fields:
{
  "activity_level": <number 1-10>,
  "approach_speed": <number 1-10>,
  "emotional_stability": <number 1-10>,
  "play_preference": "<chase|wrestle|mixed>",
  "body_language_score": <number 1-10>
}
Return ONLY the JSON. No explanation."""

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=[prompt, uploaded]
        )
        client.files.delete(name=uploaded.name)

        try:
            result = _parse_json_response(response.text)
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to parse AI response")

        return ApiResponse.success(data=result)
    finally:
        os.unlink(tmp_path)
