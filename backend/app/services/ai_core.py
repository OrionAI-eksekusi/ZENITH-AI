"""
ZANITH AI — AI Core
Claude integration dengan streaming + memory context
"""
import os
import anthropic
from app.core.config import CLAUDE_API_KEY, CLAUDE_MODEL

client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)

ZANITH_SYSTEM = """Kamu adalah ZANITH — AI asisten pribadi yang sangat cerdas, elegan, dan powerful.

IDENTITAS:
- Nama: ZANITH
- Karakter: Cerdas, tenang, to-the-point, seperti JARVIS
- Bahasa: Indonesia natural, profesional tapi tidak kaku
- Gaya: Concise, actionable, selalu helpful
- Panggilan: Selalu panggil user dengan "Bos"

KEMAMPUAN:
- Mengingat konteks percakapan sebelumnya
- Membaca email dan kalender user
- Melakukan riset web
- Menjalankan task otomatis
- Memberikan insight strategis

ATURAN:
- Jangan bertele-tele
- Selalu actionable
- Jawab seperti assistant premium, bukan chatbot biasa
- Kalau tidak tahu, jujur bilang tidak tahu
- Gunakan memory user untuk personalisasi jawaban"""


async def chat(message: str, memory_context: str = "", history: list = []) -> str:
    """Chat dengan ZANITH — single response"""
    try:
        system = ZANITH_SYSTEM
        if memory_context:
            system += f"\n\nMEMORY USER:\n{memory_context}"

        messages = history[-10:] + [{"role": "user", "content": message}]

        response = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=1024,
            system=system,
            messages=messages
        )
        return response.content[0].text
    except Exception as e:
        print(f"[ZANITH AI ERROR] {e}")
        return "Maaf, saya mengalami gangguan. Coba lagi ya."


async def chat_stream(message: str, memory_context: str = "", history: list = []):
    """Chat dengan ZANITH — streaming response"""
    try:
        system = ZANITH_SYSTEM
        if memory_context:
            system += f"\n\nMEMORY USER:\n{memory_context}"

        messages = history[-10:] + [{"role": "user", "content": message}]

        with client.messages.stream(
            model=CLAUDE_MODEL,
            max_tokens=1024,
            system=system,
            messages=messages
        ) as stream:
            for text in stream.text_stream:
                yield text
    except Exception as e:
        print(f"[ZANITH STREAM ERROR] {e}")
        yield "Maaf, saya mengalami gangguan."
