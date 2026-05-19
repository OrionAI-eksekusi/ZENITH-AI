"""
ZANITH AI — Voice Router
TTS endpoint + Voice chat endpoint
"""
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse, JSONResponse
from app.services.ai_core import chat
from app.memory.memory_engine import get_memory_context, get_history, save_conversation, auto_extract_memory
from app.voice.voice_service import text_to_speech

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/chat")
async def voice_chat(request: Request):
    """
    Voice chat endpoint:
    1. Terima transcript dari Web Speech API (frontend)
    2. Proses dengan Claude
    3. Return teks + audio base64
    """
    data = await request.json()
    user_id  = data.get("user_id", "default")
    message  = data.get("message", "")

    if not message:
        return JSONResponse({"status": "error", "message": "Pesan kosong"})

    # Get memory + history
    memory_ctx = await get_memory_context(user_id)
    history    = await get_history(user_id)

    # Claude jawab
    response_text = await chat(message, memory_ctx, history)

    # Simpan ke history
    await save_conversation(user_id, "user", message)
    await save_conversation(user_id, "assistant", response_text)
    await auto_extract_memory(user_id, message, response_text)

    # TTS — convert ke audio
    try:
        audio_bytes = await text_to_speech(response_text)
        import base64
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        return JSONResponse({
            "status":    "success",
            "response":  response_text,
            "audio_b64": audio_b64,
            "user_id":   user_id
        })
    except Exception as e:
        print(f"[TTS ERROR] {e}")
        # Fallback — return teks saja tanpa audio
        return JSONResponse({
            "status":    "success",
            "response":  response_text,
            "audio_b64": None,
            "user_id":   user_id
        })


@router.post("/tts")
async def tts_only(request: Request):
    """Convert teks ke audio — untuk replay"""
    data = await request.json()
    text = data.get("text", "")
    if not text:
        return JSONResponse({"status": "error"})
    try:
        audio_bytes = await text_to_speech(text)
        import base64
        return JSONResponse({
            "status":    "success",
            "audio_b64": base64.b64encode(audio_bytes).decode("utf-8")
        })
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)})
