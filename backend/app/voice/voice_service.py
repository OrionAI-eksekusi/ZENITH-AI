"""
ZANITH AI — Voice Service
Web Speech API (STT) + ElevenLabs (TTS)
"""
import os
import asyncio
from elevenlabs import ElevenLabs, VoiceSettings

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB")  # Adam voice

client = ElevenLabs(api_key=ELEVENLABS_API_KEY) if ELEVENLABS_API_KEY else None


async def text_to_speech(text: str) -> bytes:
    """Convert text ke audio bytes via ElevenLabs"""
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


async def text_to_speech_stream(text: str):
    """Stream audio chunks via ElevenLabs"""
    if not client:
        raise ValueError("ElevenLabs API key tidak ada")

    def _stream():
        return client.text_to_speech.convert(
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

    for chunk in await asyncio.to_thread(_stream):
        if chunk:
            yield chunk
