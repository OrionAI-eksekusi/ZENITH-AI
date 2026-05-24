"""
ZENITH AI — Voice Service
ElevenLabs STT + TTS
"""
import os
import asyncio
import httpx
from elevenlabs import ElevenLabs, VoiceSettings

def get_client():
    key = os.getenv("ELEVENLABS_API_KEY", "f5163f6d81ff94146f967a73985f7b16331a97b258e65568fd72900e514fd92a")
    return ElevenLabs(api_key=key)

def get_voice_id():
    return os.getenv("ELEVENLABS_VOICE_ID", "I7sakys8pBZ1Z5f0UhT9")

async def speech_to_text(audio_bytes: bytes, content_type: str = "audio/wav") -> str:
    key = os.getenv("ELEVENLABS_API_KEY", "")
    try:
        async with httpx.AsyncClient(timeout=30) as http:
            response = await http.post(
                "https://api.elevenlabs.io/v1/speech-to-text",
                headers={"xi-api-key": key},
                files={"file": ("audio.wav", audio_bytes, content_type)},
                data={"model_id": "scribe_v1"},
            )
            return response.json().get("text", "").strip()
    except Exception as e:
        print(f"[STT ERROR] {e}")
        return ""

async def text_to_speech(text: str) -> bytes:
    def _tts():
        client = get_client()
        audio = client.text_to_speech.convert(
            voice_id=get_voice_id(),
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
