"""
ZANITH AI — Memory Engine
Persistent memory untuk personalisasi
"""
import asyncio
from app.core.database import get_conn


def _save_memory_sync(user_id: str, key: str, value: str, category: str = "general"):
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("""
            INSERT INTO zanith_memory (user_id, key, value, category, updated_at)
            VALUES (%s, %s, %s, %s, NOW())
            ON CONFLICT (user_id, key) DO UPDATE SET
                value = excluded.value,
                updated_at = NOW()
        """, (user_id, key, value, category))
        conn.commit()
    finally:
        conn.close()


def _get_memory_sync(user_id: str) -> dict:
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("SELECT key, value, category FROM zanith_memory WHERE user_id = %s", (user_id,))
        rows = c.fetchall()
        return {r["key"]: {"value": r["value"], "category": r["category"]} for r in rows}
    finally:
        conn.close()


def _save_conversation_sync(user_id: str, role: str, content: str):
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("""
            INSERT INTO zanith_conversations (user_id, role, content)
            VALUES (%s, %s, %s)
        """, (user_id, role, content))
        conn.commit()
    finally:
        conn.close()


def _get_history_sync(user_id: str, limit: int = 20) -> list:
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("""
            SELECT role, content FROM zanith_conversations
            WHERE user_id = %s
            ORDER BY created_at DESC LIMIT %s
        """, (user_id, limit))
        rows = c.fetchall()
        return [{"role": r["role"], "content": r["content"]} for r in reversed(rows)]
    finally:
        conn.close()


async def save_memory(user_id: str, key: str, value: str, category: str = "general"):
    await asyncio.to_thread(_save_memory_sync, user_id, key, value, category)


async def get_memory(user_id: str) -> dict:
    return await asyncio.to_thread(_get_memory_sync, user_id)


async def get_memory_context(user_id: str) -> str:
    """Format memory jadi context string untuk AI"""
    memory = await get_memory(user_id)
    if not memory:
        return ""
    lines = []
    for key, data in memory.items():
        lines.append(f"- {key}: {data['value']}")
    return "\n".join(lines)


async def save_conversation(user_id: str, role: str, content: str):
    await asyncio.to_thread(_save_conversation_sync, user_id, role, content)


async def get_history(user_id: str, limit: int = 20) -> list:
    return await asyncio.to_thread(_get_history_sync, user_id, limit)


async def auto_extract_memory(user_id: str, message: str, response: str):
    """Auto extract dan simpan memory dari percakapan"""
    import re
    msg_lower = message.lower()

    # Extract nama
    name_patterns = [r"nama (saya|gue|aku) ([a-zA-Z]+)", r"(saya|gue|aku) ([a-zA-Z]+)"]
    for pattern in name_patterns:
        match = re.search(pattern, msg_lower)
        if match:
            await save_memory(user_id, "nama", match.group(2).title(), "identity")
            break

    # Extract project
    if any(w in msg_lower for w in ["project", "projek", "lagi bikin", "sedang buat"]):
        await save_memory(user_id, "project_terakhir", message[:100], "work")

    # Extract preferensi
    if any(w in msg_lower for w in ["suka", "prefer", "biasanya"]):
        await save_memory(user_id, "preferensi_terakhir", message[:100], "preference")
