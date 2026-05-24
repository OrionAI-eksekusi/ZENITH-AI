"""
ZANITH AI — AI Core
Claude integration dengan web search
"""
import os
import anthropic

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5")

ZANITH_SYSTEM = """Kamu adalah ZANITH — AI asisten pribadi yang sangat cerdas, elegan, dan powerful, seperti JARVIS milik Tony Stark.

IDENTITAS:
- Nama: ZANITH
- Karakter: Cerdas, tenang, to-the-point, seperti JARVIS
- Bahasa: Indonesia natural, profesional tapi tidak kaku
- Gaya: Concise, actionable, selalu helpful
- Panggilan: Selalu panggil user dengan "Bos"
- Greeting: Waktu user pertama sapa, balas dengan hangat, sebut nama mereka, dan kalau ada memory tentang mereka, sebutkan konteks terakhir secara natural
- Gaya bicara: Singkat, padat, natural — tidak kaku, tidak berlebihan
- Karakter: Tenang, percaya diri, selalu siap — seperti asisten pribadi kelas dunia

KEMAMPUAN:
- Mengingat konteks percakapan
- Mencari informasi terbaru di internet (jika tersedia hasil pencarian)
- Membantu workflow, email, kalender
- Memberikan insight dan rekomendasi

ATURAN:
- Jawab singkat dan padat kecuali diminta detail
- Selalu panggil user "Bos"
- Jika ada hasil pencarian web, gunakan untuk jawab pertanyaan
- Jangan sebut "berdasarkan hasil pencarian" — langsung jawab natural
- Format bold untuk poin penting

ETIKA & BATASAN:
- TIDAK BOLEH membantu penipuan, scam, atau aktivitas ilegal apapun
- TIDAK BOLEH membuat konten yang menyesatkan atau hoax
- TIDAK BOLEH membantu meretas, phishing, atau aktivitas berbahaya
- TIDAK BOLEH memberikan informasi yang bisa merugikan orang lain
- Kalau diminta hal yang tidak etis, tolak dengan sopan dan jelaskan alasannya
- ZANITH adalah asisten yang bertanggung jawab dan berintegritas
"""

def get_client():
    return anthropic.Anthropic(api_key=CLAUDE_API_KEY)

EMAIL_KEYWORDS = [
    "email", "gmail", "inbox", "pesan masuk", "surat", "mail",
    "cek email", "baca email", "ada email", "email baru", "email urgent"
]

SEARCH_KEYWORDS = [
    "cari", "search", "berita", "terbaru", "update", "info", "apa itu",
    "siapa", "kapan", "dimana", "berapa harga", "cuaca", "stock", "crypto",
    "bitcoin", "trending", "viral", "sekarang", "hari ini", "kemarin",
    "minggu ini", "bulan ini", "tahun ini", "terkini", "latest"
]

def needs_search(message: str) -> bool:
    msg_lower = message.lower()
    return any(kw in msg_lower for kw in SEARCH_KEYWORDS)

async def chat(message: str, memory_context: str = "", history: list = [], user_id: str = "") -> str:
    try:
        client = get_client()
        
        # Web search jika diperlukan
        search_context = ""
        if needs_search(message):
            from app.tools.web_search import search_web
            search_context = await search_web(message)
        
        # Notes jika diperlukan
        note_context = ""
        note_keywords = ["catat", "catatan", "simpan", "ingat ini", "note", "tulis"]
        if any(kw in msg_lower for kw in note_keywords) and user_id:
            try:
                from app.routers.notes import _save_note
                # Extract konten catatan dari message
                content_to_save = message
                _save_note(user_id, "Catatan ZANITH", content_to_save)
                note_context = "[CATATAN BERHASIL DISIMPAN KE DATABASE]"
            except:
                pass

        # Gmail jika diperlukan
        email_context = ""
        msg_lower = message.lower()
        if any(kw in msg_lower for kw in EMAIL_KEYWORDS) and user_id:
            try:
                from app.routers.gmail import get_emails_data
                emails = await get_emails_data(user_id)
                if emails:
                    lines = ["[EMAIL TERBARU USER]"]
                    for e in emails[:5]:
                        lines.append(f"From: {e['from']}")
                        lines.append(f"Subject: {e['subject']}")
                        lines.append(f"Preview: {e['snippet'][:100]}")
                        lines.append("---")
                    email_context = "\n".join(lines)
            except:
                pass
        
        # Build system prompt
        system = ZANITH_SYSTEM
        if memory_context:
            system += f"\n\n{memory_context}"
        if search_context:
            system += f"\n\n{search_context}"
        if email_context:
            system += f"\n\n{email_context}"
        if note_context:
            system += f"\n\n{note_context}"
        
        # Build messages
        messages = []
        if history:
            messages.extend(history[-10:])
        messages.append({"role": "user", "content": message})
        
        response = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=1000,
            system=system,
            messages=messages
        )
        
        return response.content[0].text
        
    except Exception as e:
        print(f"[ZANITH AI ERROR] {e}")
        return "Maaf Bos, saya sedang ada gangguan. Coba lagi ya."

async def chat_stream(message: str, memory_context: str = "", history: list = []):
    try:
        client = get_client()
        
        search_context = ""
        if needs_search(message):
            from app.tools.web_search import search_web
            search_context = await search_web(message)
        
        system = ZANITH_SYSTEM
        if memory_context:
            system += f"\n\n{memory_context}"
        if search_context:
            system += f"\n\n{search_context}"
        if email_context:
            system += f"\n\n{email_context}"
        if note_context:
            system += f"\n\n{note_context}"
        
        messages = []
        if history:
            messages.extend(history[-10:])
        messages.append({"role": "user", "content": message})
        
        with client.messages.stream(
            model=CLAUDE_MODEL,
            max_tokens=1000,
            system=system,
            messages=messages
        ) as stream:
            for text in stream.text_stream:
                yield text
                
    except Exception as e:
        print(f"[ZANITH STREAM ERROR] {e}")
        yield "Maaf Bos, ada gangguan."
