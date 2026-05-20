"""
ZANITH AI — Voice Service
ElevenLabs STT + TTS
"""
import os
import asyncio
import httpx
from elevenlabs import ElevenLabs, VoiceSettings

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB")

client = ElevenLabs(api_key=ELEVENLABS_API_KEY) if ELEVENLABS_API_KEY else None


async def speech_to_text(audio_bytes: bytes, content_type: str = "audio/webm") -> str:
    """Convert audio bytes ke teks via ElevenLabs STT"""
    try:
        async with httpx.AsyncClient(timeout=30) as http:
            response = await http.post(
                "https://api.elevenlabs.io/v1/speech-to-text",
                headers={"xi-api-key": ELEVENLABS_API_KEY},
                files={"file": ("audio.webm", audio_bytes, content_type)},
                data={"model_id": "scribe_v1"},
            )
            data = response.json()
            return data.get("text", "").strip()
    except Exception as e:
        print(f"[STT ERROR] {e}")
        return ""


async def text_to_speech(text: str) -> bytes:
    """Convert teks ke audio bytes via ElevenLabs TTS"""
    if not client:
        raise ValueError("ElevenLabs API key tidak ada")

    def _tts():
        audio = client.text_to_speech.convert(
            voice_id=ELEVENLABS_VOICE_ID,
            text=text,
            model_id="eleven_multilingual_v2",
            voice_settings=VoiceSettings(
                stability=0.5,
                similarity_boost=0.8,
                style=0.2,
                use_speaker_boost=True,
            ),
            output_format="mp3_44100_128",
        )
        return b"".join(audio)

    return await asyncio.to_thread(_tts)
