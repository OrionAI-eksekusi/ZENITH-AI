"""
ZANITH AI — Chat Router
Main conversation endpoint dengan streaming
"""
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse, JSONResponse
from app.services.ai_core import chat, chat_stream
from app.memory.memory_engine import (
    get_memory_context, get_history,
    save_conversation, auto_extract_memory
)
import json

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/")
async def chat_endpoint(request: Request):
    """Chat dengan ZANITH — regular response"""
    data = await request.json()
    user_id = data.get("user_id", "default")
    message = data.get("message", "")

    if not message:
        return JSONResponse({"status": "error", "message": "Pesan kosong"})

    # Ambil memory + history
    memory_ctx = await get_memory_context(user_id)
    history    = await get_history(user_id)

    # Chat
    response = await chat(message, memory_ctx, history)

    # Simpan ke history + auto extract memory
    await save_conversation(user_id, "user", message)
    await save_conversation(user_id, "assistant", response)
    await auto_extract_memory(user_id, message, response)

    return JSONResponse({
        "status":   "success",
        "response": response,
        "user_id":  user_id
    })


@router.post("/stream")
async def chat_stream_endpoint(request: Request):
    """Chat dengan ZANITH — streaming response"""
    data    = await request.json()
    user_id = data.get("user_id", "default")
    message = data.get("message", "")

    memory_ctx = await get_memory_context(user_id)
    history    = await get_history(user_id)

    # Simpan pesan user
    await save_conversation(user_id, "user", message)

    async def generate():
        full_response = ""
        async for chunk in chat_stream(message, memory_ctx, history):
            full_response += chunk
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"

        # Simpan response lengkap + extract memory
        await save_conversation(user_id, "assistant", full_response)
        await auto_extract_memory(user_id, message, full_response)
        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/history/{user_id}")
async def get_chat_history(user_id: str):
    """Ambil history percakapan"""
    history = await get_history(user_id, limit=50)
    return JSONResponse({"status": "success", "history": history})


@router.delete("/history/{user_id}")
async def clear_history(user_id: str):
    """Hapus history percakapan"""
    from app.core.database import get_conn
    import asyncio

    def _clear():
        conn = get_conn()
        try:
            c = conn.cursor()
            c.execute("DELETE FROM zanith_conversations WHERE user_id = %s", (user_id,))
            conn.commit()
        finally:
            conn.close()

    await asyncio.to_thread(_clear)
    return JSONResponse({"status": "success", "message": "History cleared"})
