"""
ZANITH AI — Auth Router
"""
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from app.core.database import get_conn
import jwt
import os
import uuid
import hashlib
import random
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "zanith-secret-2026")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def _register_user(email: str, password: str, name: str) -> dict:
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("SELECT id FROM zanith_users WHERE email = %s", (email,))
        if c.fetchone():
            return {"error": "Email sudah terdaftar"}
        user_id = str(random.randint(100000, 999999))
        hashed = hash_password(password)
        user_id = str(random.randint(100000, 999999))
        c.execute("""
            INSERT INTO zanith_users (user_id, email, name, password_hash, created_at)
            VALUES (%s, %s, %s, %s, NOW())
        """, (user_id, email, name, hashed))
        conn.commit()
        return {"user_id": user_id, "email": email, "name": name}
    finally:
        conn.close()

def _login_user(email: str, password: str) -> dict:
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("SELECT id, email, name, password_hash FROM zanith_users WHERE email = %s", (email,))
        user = c.fetchone()
        if not user:
            return {"error": "Email tidak ditemukan"}
        if not verify_password(password, user["password_hash"]):
            return {"error": "Password salah"}
        return {"user_id": str(user["id"]), "email": user["email"], "name": user["name"]}
    finally:
        conn.close()

@router.post("/register")
async def register(request: Request):
    data = await request.json()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    name = data.get("name", "").strip()
    if not email or not password or not name:
        return JSONResponse({"status": "error", "message": "Email, password, dan nama wajib diisi"})
    result = _register_user(email, password, name)
    if "error" in result:
        return JSONResponse({"status": "error", "message": result["error"]})
    token = create_token(result["user_id"], result["email"])
    
    # Auto simpan nama ke memory ZANITH
    try:
        from app.memory.memory_engine import save_memory
        import asyncio
        asyncio.create_task(save_memory(result["user_id"], "nama", result["name"], "identity"))
    except:
        pass
    
    return JSONResponse({"status": "success", "token": token, "user": result})

@router.post("/login")
async def login(request: Request):
    data = await request.json()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    if not email or not password:
        return JSONResponse({"status": "error", "message": "Email dan password wajib diisi"})
    result = _login_user(email, password)
    if "error" in result:
        return JSONResponse({"status": "error", "message": result["error"]})
    token = create_token(result["user_id"], result["email"])
    
    # Auto simpan nama ke memory ZANITH
    try:
        from app.memory.memory_engine import save_memory
        import asyncio
        asyncio.create_task(save_memory(result["user_id"], "nama", result["name"], "identity"))
    except:
        pass
    
    return JSONResponse({"status": "success", "token": token, "user": result})

@router.get("/me")
async def me(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return JSONResponse({"status": "error", "message": "Token tidak ada"})
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return JSONResponse({"status": "success", "user": payload})
    except Exception:
        return JSONResponse({"status": "error", "message": "Token invalid"})

@router.get("/google/{redirect_after}")
async def google_login(redirect_after: str = "app"):
    """Redirect ke Google OAuth — login + Gmail sekaligus"""
    from app.routers.gmail import get_flow
    flow = get_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=f"google_login_{redirect_after}"
    )
    from fastapi.responses import RedirectResponse
    return RedirectResponse(auth_url)
