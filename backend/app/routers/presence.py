"""
ZENITH AI — Presence Layer
Proaktif update untuk user
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.core.database import get_conn
from datetime import datetime, date
import pytz

router = APIRouter(prefix="/presence", tags=["presence"])

WIB = pytz.timezone("Asia/Jakarta")

def get_greeting(hour: int) -> str:
    if hour < 12: return "Selamat pagi"
    if hour < 15: return "Selamat siang"
    if hour < 18: return "Selamat sore"
    return "Selamat malam"

async def get_presence_message(user_id: str) -> dict:
    now = datetime.now(WIB)
    hour = now.hour
    greeting = get_greeting(hour)
    
    messages = []
    
    # Greeting berdasarkan waktu
    if hour in [7, 8, 9]:
        messages.append(f"{greeting} Bos! Siap produktif hari ini?")
    elif hour in [12, 13]:
        messages.append("Sudah makan siang Bos? Jangan sampai lupa!")
    elif hour in [17, 18]:
        messages.append("Hampir selesai kerja hari ini Bos. Ada yang perlu diselesaikan?")
    elif hour in [21, 22, 23]:
        messages.append("Sudah malam Bos, jangan lupa istirahat ya!")

    # Cek catatan yang belum selesai
    try:
        conn = get_conn()
        c = conn.cursor()
        c.execute("""
            SELECT content FROM zenith_notes 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT 1
        """, (user_id,))
        note = c.fetchone()
        conn.close()
        if note:
            messages.append(f"Reminder: kamu punya catatan — '{note['content'][:60]}...'")
    except:
        pass

    # Cek usage limit
    try:
        conn = get_conn()
        c = conn.cursor()
        c.execute("SELECT plan, commands_today FROM zenith_users WHERE user_id = %s", (user_id,))
        user = c.fetchone()
        conn.close()
        if user:
            limit = 10 if user["plan"] == "trial" else 20
            used = user["commands_today"] or 0
            remaining = limit - used
            if remaining <= 3 and remaining > 0:
                messages.append(f"⚠️ Sisa {remaining} perintah hari ini Bos!")
    except:
        pass

    return {
        "has_message": len(messages) > 0,
        "messages": messages,
        "time": now.strftime("%H:%M"),
        "greeting": greeting
    }

@router.get("/check/{user_id}")
async def check_presence(user_id: str):
    result = await get_presence_message(user_id)
    return JSONResponse(result)
