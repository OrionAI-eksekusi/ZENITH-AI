from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import os
import json
import anthropic

router = APIRouter(prefix="/screen", tags=["screen"])

@router.post("/analyze")
async def analyze_screen(request: Request):
    try:
        body = await request.json()
        image_data = body.get("image", "")
        command = body.get("command", "apa yang ada di layar?")
        if "," in image_data:
            image_data = image_data.split(",")[1]
        if not image_data:
            return JSONResponse({"status": "error", "response": "Tidak ada screenshot"}, status_code=400)
        client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY", ""))
        system = """Kamu adalah ZENITH, AI asisten yang menganalisa layar komputer user.
Jawab dalam Bahasa Indonesia yang natural dan singkat.
Jika WhatsApp terbuka: sebutkan chat yang terlihat dan pesan belum dibaca.
Jika ada aplikasi lain: deskripsikan apa yang terjadi di layar.
Selalu mulai dengan apa yang kamu lihat, lalu berikan rekomendasi."""
        response = client.messages.create(
            model=os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5"),
            max_tokens=500,
            system=system,
            messages=[{"role": "user", "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_data}},
                {"type": "text", "text": command}
            ]}]
        )
        return JSONResponse({"status": "success", "response": response.content[0].text})
    except Exception as e:
        return JSONResponse({"status": "error", "response": f"Gagal analisa layar: {str(e)}"}, status_code=500)

@router.post("/agent")
async def screen_agent(request: Request):
    try:
        body = await request.json()
        image_data = body.get("image", "")
        command = body.get("command", "")
        step_history = body.get("step_history", [])
        user_memory = body.get("user_memory", "")

        if "," in image_data:
            image_data = image_data.split(",")[1]

        client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY", ""))

        history_text = ""
        if step_history:
            history_text = f"\n\nLangkah yang sudah dilakukan ({len(step_history)} langkah):\n"
            for i, step in enumerate(step_history):
                desc = step.get('text') or step.get('url') or step.get('app_name') or step.get('question') or ''
                history_text += f"{i+1}. {step.get('action', '')}: {desc}\n"

        system = """Kamu adalah ZENITH Computer Use Agent — AI yang mengontrol komputer user untuk menyelesaikan tugas.

Analisa screenshot dan tentukan SATU aksi berikutnya.

Return HANYA JSON valid (tanpa markdown, tanpa backtick, tanpa penjelasan):
{
  "done": false,
  "message": "Pesan singkat untuk user dalam Bahasa Indonesia",
  "action": "click|type|open_url|open_app|press_enter|wait|ask_user|complete",
  "x_percent": 0.5,
  "y_percent": 0.5,
  "text": "teks yang akan diketik",
  "url": "https://...",
  "app_name": "NamaAplikasi",
  "question": "pertanyaan jika butuh info dari user",
  "wait_ms": 1000
}

ATURAN PENTING:
- x_percent dan y_percent: 0.0-1.0 (persentase dari dimensi layar) — tujukan ke TENGAH elemen
- WhatsApp: search bar di kiri atas, list chat di panel kiri, input pesan di bawah
- Form: identifikasi setiap field dari posisinya
- done=true hanya saat tugas BENAR-BENAR selesai
- action=ask_user jika butuh informasi yang tidak ada di layar atau memori
- action=complete saat tugas selesai
- Jika tidak yakin koordinat, gunakan ask_user minta user klik manual
- Pesan singkat dalam Bahasa Indonesia"""

        user_prompt = f"""Tugas: {command}

Info user: {user_memory if user_memory else 'Tidak ada memori user'}{history_text}

Apa SATU aksi berikutnya untuk menyelesaikan tugas ini?"""

        response = client.messages.create(
            model=os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5"),
            max_tokens=400,
            system=system,
            messages=[{"role": "user", "content": [
                {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_data}},
                {"type": "text", "text": user_prompt}
            ]}]
        )

        result_text = response.content[0].text.strip()
        result_text = result_text.replace('```json', '').replace('```', '').strip()
        result = json.loads(result_text)
        return JSONResponse({"status": "success", **result})

    except Exception as e:
        return JSONResponse({
            "status": "error",
            "done": True,
            "action": "complete",
            "message": f"Maaf, terjadi error: {str(e)}"
        }, status_code=500)
