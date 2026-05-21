"""
ZANITH AI — Memory Engine Level 2
Persistent memory yang lebih pintar
"""
import asyncio
import re
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
    memory = await get_memory(user_id)
    if not memory:
        return ""
    
    categories = {
        "identity": "Identitas User",
        "work": "Pekerjaan & Project",
        "preference": "Preferensi",
        "task": "Task & Goals",
        "general": "Informasi Umum"
    }
    
    grouped = {}
    for key, data in memory.items():
        cat = data["category"]
        if cat not in grouped:
            grouped[cat] = []
        grouped[cat].append(f"  - {key}: {data['value']}")
    
    lines = ["[MEMORY TENTANG USER]"]
    for cat, label in categories.items():
        if cat in grouped:
            lines.append(f"{label}:")
            lines.extend(grouped[cat])
    
    return "\n".join(lines)

async def save_conversation(user_id: str, role: str, content: str):
    await asyncio.to_thread(_save_conversation_sync, user_id, role, content)

async def get_history(user_id: str, limit: int = 20) -> list:
    return await asyncio.to_thread(_get_history_sync, user_id, limit)

async def auto_extract_memory(user_id: str, message: str, response: str):
    msg_lower = message.lower()
    
    # Nama
    name_patterns = [
        r"nama (?:saya|gue|aku|ku) (?:adalah |itu )?([a-zA-Z]+)",
        r"(?:panggil|sebut) (?:saya|gue|aku) ([a-zA-Z]+)",
        r"(?:saya|gue|aku) ([A-Z][a-z]+)",
    ]
    for pattern in name_patterns:
        match = re.search(pattern, message)
        if match:
            await save_memory(user_id, "nama", match.group(1).title(), "identity")
            break

    # Pekerjaan
    job_patterns = [
        r"(?:saya|gue|aku) (?:adalah |seorang )?([a-zA-Z\s]+(?:developer|designer|manager|founder|ceo|cto|engineer|dokter|guru|pelajar|mahasiswa))",
        r"(?:kerja|bekerja) (?:sebagai|jadi) ([a-zA-Z\s]+)",
    ]
    for pattern in job_patterns:
        match = re.search(pattern, msg_lower)
        if match:
            await save_memory(user_id, "pekerjaan", match.group(1).strip(), "identity")
            break

    # Project aktif
    project_keywords = ["lagi bikin", "sedang bikin", "lagi buat", "sedang buat", "project", "projek", "startup", "aplikasi", "app", "website"]
    if any(w in msg_lower for w in project_keywords):
        await save_memory(user_id, "project_aktif", message[:150], "work")

    # Task terakhir
    task_keywords = ["harus", "perlu", "mau", "akan", "rencana", "target", "deadline"]
    if any(w in msg_lower for w in task_keywords):
        await save_memory(user_id, "task_terakhir", message[:150], "task")

    # Lokasi
    location_patterns = [
        r"(?:tinggal|domisili|based|di) ([A-Z][a-zA-Z\s]+(?:jakarta|bandung|surabaya|bali|yogyakarta|indonesia|singapore|malaysia))",
    ]
    for pattern in location_patterns:
        match = re.search(pattern, msg_lower)
        if match:
            await save_memory(user_id, "lokasi", match.group(1).strip().title(), "identity")
            break

    # Preferensi
    pref_keywords = ["suka", "prefer", "favorit", "biasanya pakai", "senang"]
    if any(w in msg_lower for w in pref_keywords):
        await save_memory(user_id, "preferensi", message[:150], "preference")
