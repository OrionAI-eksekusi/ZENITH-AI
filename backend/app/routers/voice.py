"""
ZANITH AI — Voice Router
MediaRecorder (browser) → ElevenLabs STT → Claude → ElevenLabs TTS
"""
from fastapi import APIRouter, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from app.services.ai_core import chat
from app.memory.memory_engine import get_memory_context, get_history, save_conversation, auto_extract_memory
from app.voice.voice_service import text_to_speech, speech_to_text

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...), user_id: str = Form(default="default")):
    """
    1. Terima audio dari browser (MediaRecorder)
    2. Transcribe via ElevenLabs STT
    3. Process dengan Claude
    4. Return teks + audio TTS
    """
    try:
        audio_bytes = await audio.read()
        # STT
        transcript = await speech_to_text(audio_bytes, audio.content_type or "audio/webm")
        if not transcript or not transcript.strip():
            return JSONResponse({"status": "error", "message": "Tidak terdengar suara"})

        # Claude
        memory_ctx = await get_memory_context(user_id)
        history    = await get_history(user_id)
        response_text = await chat(transcript, memory_ctx, history)

        # Simpan history
        await save_conversation(user_id, "user", transcript)
        await save_conversation(user_id, "assistant", response_text)
        await auto_extract_memory(user_id, transcript, response_text)

        # TTS
        try:
            audio_out = await text_to_speech(response_text)
            import base64
            audio_b64 = base64.b64encode(audio_out).decode("utf-8")
        except Exception as e:
            print(f"[TTS ERROR] {e}")
            audio_b64 = None

        return JSONResponse({
            "status":     "success",
            "transcript": transcript,
            "response":   response_text,
            "audio_b64":  audio_b64,
        })
    except Exception as e:
        print(f"[VOICE ERROR] {e}")
        return JSONResponse({"status": "error", "message": str(e)})


@router.post("/tts")
async def tts_only(request: Request):
    """Convert teks ke audio"""
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
