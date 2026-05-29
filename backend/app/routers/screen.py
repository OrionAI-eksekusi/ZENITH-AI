from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import os
import anthropic

router = APIRouter(prefix="/screen", tags=["screen"])

@router.post("/analyze")
async def analyze_screen(request: Request):
    try:
        body = await request.json()
        image_data = body.get("image", "")
        command = body.get("command", "apa yang ada di layar?")

        # Hapus data URL prefix jika ada
        if "," in image_data:
            image_data = image_data.split(",")[1]

        if not image_data:
            return JSONResponse({"status": "error", "response": "Tidak ada screenshot yang diterima"}, status_code=400)

        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

        system = """Kamu adalah ZENITH, AI asisten pribadi yang sedang menganalisa layar komputer user.
Jawab dalam Bahasa Indonesia yang natural, singkat, dan helpful.
Jika WhatsApp terbuka: sebutkan chat yang terlihat dan ada tidaknya pesan belum dibaca.
Jika diminta balas pesan: konfirmasi apakah chat yang dimaksud sudah terbuka.
Jika ada aplikasi lain: deskripsikan apa yang sedang terjadi di layar.
Selalu mulai dengan apa yang kamu lihat, lalu berikan rekomendasi aksi."""

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            system=system,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": image_data
                        }
                    },
                    {
                        "type": "text",
                        "text": command
                    }
                ]
            }]
        )

        analysis = response.content[0].text
        return JSONResponse({"status": "success", "response": analysis})

    except Exception as e:
        return JSONResponse({"status": "error", "response": f"Gagal analisa layar: {str(e)}"}, status_code=500)
