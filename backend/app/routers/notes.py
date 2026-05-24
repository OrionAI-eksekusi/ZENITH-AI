"""
ZANITH AI — Notes Router
Simpan dan ambil catatan user
"""
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.core.database import get_conn
from datetime import datetime

router = APIRouter(prefix="/notes", tags=["notes"])

def _save_note(user_id: str, title: str, content: str) -> dict:
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("""
            INSERT INTO zanith_notes (user_id, title, content, created_at)
            VALUES (%s, %s, %s, NOW()) RETURNING id
        """, (user_id, title, content))
        note_id = c.fetchone()["id"]
        conn.commit()
        return {"id": note_id, "title": title, "content": content}
    finally:
        conn.close()

def _get_notes(user_id: str, limit: int = 10) -> list:
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("""
            SELECT id, title, content, created_at 
            FROM zanith_notes 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT %s
        """, (user_id, limit))
        rows = c.fetchall()
        return [{"id": r["id"], "title": r["title"], "content": r["content"], "created_at": str(r["created_at"])} for r in rows]
    finally:
        conn.close()

@router.post("/save")
async def save_note(request: Request):
    data = await request.json()
    user_id = data.get("user_id", "")
    title = data.get("title", "Catatan")
    content = data.get("content", "")
    if not content:
        return JSONResponse({"status": "error", "message": "Konten catatan kosong"})
    note = _save_note(user_id, title, content)
    return JSONResponse({"status": "success", "note": note})

@router.get("/list/{user_id}")
async def get_notes(user_id: str):
    notes = _get_notes(user_id)
    return JSONResponse({"status": "success", "notes": notes})
