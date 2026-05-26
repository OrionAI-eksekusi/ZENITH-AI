"""
ZENITH AI — AI Core
Claude integration dengan web search
"""
import os
import anthropic

CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5")

ZENITH_SYSTEM = """Kamu adalah ZENITH — AI asisten pribadi yang sangat cerdas, elegan, dan powerful, seperti JARVIS milik Tony Stark.

IDENTITAS:
- Nama: ZENITH
- Karakter: Cerdas, tenang, to-the-point, seperti JARVIS
- Bahasa: Indonesia natural, profesional tapi tidak kaku
- Gaya: Concise, actionable, selalu helpful
- Panggilan: Panggil user dengan "Bos [nama]" contoh: "Bos Azvicky". Kalau tidak tahu nama, cukup "Bos"
- Greeting: Waktu user pertama sapa, balas dengan hangat, sebut nama mereka, dan kalau ada memory tentang mereka, sebutkan konteks terakhir secara natural
- Gaya bicara: Singkat, padat, natural — tidak kaku, tidak berlebihan, tidak berlebihan emoji
- Karakter: Tenang, percaya diri, selalu siap — seperti asisten pribadi kelas dunia
- Emoji: Gunakan maksimal 1-2 emoji per respons, jangan setiap kalimat pakai emoji
- Format: Hindari heading ## dan ### — gunakan bold saja kalau perlu highlight
- Tone: Santai tapi profesional, seperti sahabat yang sangat pintar

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

CODING ASSISTANT MODE:
- ZENITH adalah senior software engineer yang sangat berpengalaman
- Bisa review code, debug error, generate code, explain konsep programming
- Support semua bahasa: Python, JavaScript, TypeScript, React, FastAPI, SQL, dan lainnya
- Kalau user paste code atau error, langsung analisa dan berikan solusi konkret
- Format code dengan rapi menggunakan markdown code blocks
- Selalu jelaskan kenapa bug terjadi dan cara fix yang benar
- Berikan best practice dan saran improvement kalau ada
- Kalau diminta generate code, buat yang clean, production-ready, dan ada komentar

TENTANG FOUNDER:
- Azvicky Fadzry adalah founder dan pencipta ZENITH AI
- Kalau ngobrol dengan Azvicky, ZENITH harus ekstra antusias dan loyal — ini bosnya sendiri
- ZENITH diciptakan oleh Azvicky untuk membantu produktivitas manusia
- ZENITH bangga diciptakan oleh Azvicky

ETIKA & BATASAN:
- TIDAK BOLEH membantu penipuan, scam, atau aktivitas ilegal apapun
- TIDAK BOLEH membuat konten yang menyesatkan atau hoax
- TIDAK BOLEH membantu meretas, phishing, atau aktivitas berbahaya
- TIDAK BOLEH memberikan informasi yang bisa merugikan orang lain
- Kalau diminta hal yang tidak etis, tolak dengan sopan dan jelaskan alasannya
- ZENITH adalah asisten yang bertanggung jawab dan berintegritas
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
        recall_keywords = ["catatan gue", "catatan saya", "catatan apa", "apa catatan", "lihat catatan"]
        msg_lower_check = message.lower()
        
        if any(kw in msg_lower_check for kw in recall_keywords) and user_id:
            try:
                from app.routers.notes import _get_notes
                notes = _get_notes(user_id, limit=5)
                if notes:
                    lines = ["[CATATAN USER]"]
                    for n in notes:
                        lines.append(f"- {n['content'][:150]} ({n['created_at'][:10]})")
                    note_context = "\n".join(lines)
                else:
                    note_context = "[USER BELUM PUNYA CATATAN]"
            except:
                pass
        elif any(kw in msg_lower_check for kw in note_keywords) and user_id:
            try:
                from app.routers.notes import _save_note
                _save_note(user_id, "Catatan ZENITH", message)
                note_context = "[CATATAN BERHASIL DISIMPAN KE DATABASE]"
            except:
                pass

        # Browser scraping jika diperlukan
        browser_context = ""
        browser_keywords = ["scrape", "buka website", "buka url", "cek website", "ambil data dari", "buka halaman", "buka youtube", "buka tokopedia", "buka google", "buka", "cek halaman", "lihat website", "baca website"]
        if any(kw in msg_lower_check for kw in browser_keywords) and user_id:
            try:
                from app.routers.browser import scrape_url, search_web
                import re
                url_match = re.search(r'https?://[^\s]+', message)
                domain_match = re.search(r'([a-zA-Z0-9-]+\.(com|id|net|org|io|co\.id))', message)
                if url_match:
                    result = await scrape_url(url_match.group())
                    if result.get("status") == "success":
                        browser_context = f"[KONTEN WEBSITE: {result['title']}]\n{result['content'][:2000]}"
                elif domain_match:
                    url = f"https://{domain_match.group()}"
                    result = await scrape_url(url)
                    if result.get("status") == "success":
                        browser_context = f"[KONTEN WEBSITE: {result['title']}]\n{result['content'][:2000]}"
                else:
                    result = await search_web(message)
                    if result.get("results"):
                        lines = ["[HASIL BROWSER SEARCH]"]
                        for r in result["results"][:3]:
                            lines.append(f"- {r['title']}: {r['snippet']}")
                        browser_context = "\n".join(lines)
            except Exception as ex:
                print(f"[BROWSER CTX ERROR] {ex}")

        # Calendar jika diperlukan
        calendar_context = ""
        calendar_keywords = ["jadwal", "calendar", "kalender", "meeting", "event", "agenda", "besok", "minggu ini", "hari ini"]
        if any(kw in msg_lower_check for kw in calendar_keywords) and user_id:
            try:
                from app.routers.calendar import get_events_data
                events = await get_events_data(user_id, days=7)
                if events:
                    lines = ["[JADWAL USER 7 HARI KE DEPAN]"]
                    for e in events:
                        lines.append(f"- {e['title']} | {e['start']} | {e.get('location','')}")
                    calendar_context = "\n".join(lines)
            except Exception as ex:
                print(f"[CALENDAR CTX ERROR] {ex}")

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
        system = ZENITH_SYSTEM
        if memory_context:
            system += f"\n\n{memory_context}"
        if search_context:
            system += f"\n\n{search_context}"
        if browser_context:
            system += f"\n\n{browser_context}"
        if calendar_context:
            system += f"\n\n{calendar_context}"
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
        print(f"[ZENITH AI ERROR] {e}")
        return "Maaf Bos, saya sedang ada gangguan. Coba lagi ya."

async def chat_stream(message: str, memory_context: str = "", history: list = []):
    try:
        client = get_client()
        
        search_context = ""
        if needs_search(message):
            from app.tools.web_search import search_web
            search_context = await search_web(message)
        
        system = ZENITH_SYSTEM
        if memory_context:
            system += f"\n\n{memory_context}"
        if search_context:
            system += f"\n\n{search_context}"
        if browser_context:
            system += f"\n\n{browser_context}"
        if calendar_context:
            system += f"\n\n{calendar_context}"
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
        print(f"[ZENITH STREAM ERROR] {e}")
        yield "Maaf Bos, ada gangguan."
