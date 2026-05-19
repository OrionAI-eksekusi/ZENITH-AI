"""
ZANITH AI — Database Core
PostgreSQL connection + table initialization
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.getenv("DATABASE_URL", "")

def get_conn():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

async def init_db():
    """Init semua tabel ZANITH"""
    import asyncio
    await asyncio.to_thread(_init_db_sync)

def _init_db_sync():
    conn = get_conn()
    try:
        c = conn.cursor()

        # Users
        c.execute("""
            CREATE TABLE IF NOT EXISTS zanith_users (
                id          SERIAL PRIMARY KEY,
                user_id     TEXT UNIQUE NOT NULL,
                name        TEXT DEFAULT '',
                email       TEXT DEFAULT '',
                created_at  TIMESTAMP DEFAULT NOW()
            )
        """)

        # Memory — long term
        c.execute("""
            CREATE TABLE IF NOT EXISTS zanith_memory (
                id          SERIAL PRIMARY KEY,
                user_id     TEXT NOT NULL,
                key         TEXT NOT NULL,
                value       TEXT NOT NULL,
                category    TEXT DEFAULT 'general',
                updated_at  TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, key)
            )
        """)

        # Conversations
        c.execute("""
            CREATE TABLE IF NOT EXISTS zanith_conversations (
                id          SERIAL PRIMARY KEY,
                user_id     TEXT NOT NULL,
                role        TEXT NOT NULL,
                content     TEXT NOT NULL,
                created_at  TIMESTAMP DEFAULT NOW()
            )
        """)

        # Tasks
        c.execute("""
            CREATE TABLE IF NOT EXISTS zanith_tasks (
                id          SERIAL PRIMARY KEY,
                user_id     TEXT NOT NULL,
                title       TEXT NOT NULL,
                status      TEXT DEFAULT 'pending',
                priority    TEXT DEFAULT 'medium',
                due_date    TEXT DEFAULT '',
                created_at  TIMESTAMP DEFAULT NOW()
            )
        """)

        conn.commit()
        print("[ZANITH] ✅ Database initialized")
    finally:
        conn.close()
