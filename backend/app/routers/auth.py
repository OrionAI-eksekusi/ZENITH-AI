"""
ZANITH AI — Auth Router
Register, Login, JWT
"""
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from passlib.hash import bcrypt
from app.core.database import get_conn
import jwt
import os
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "zanith-secret-2026")
JWT_EXPIRY_DAYS = 30

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRY_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def _register_user(email: str, password: str, name: str) -> dict:
    conn = get_conn()
    try:
        c = conn.cursor()
        # Cek email sudah ada
        c.execute("SELECT id FROM zanith_users WHERE email = %s", (email,))
        if c.fetchone():
            return {"error": "Email sudah terdaftar"}
        
        user_id = str(uuid.uuid4())[:8]
        hashed = bcrypt.hash(password)
        
        c.execute("""
            INSERT INTO zanith_users (id, email, name, password_hash, created_at)
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
        if not bcrypt.verify(password, user["password_hash"]):
            return {"error": "Password salah"}
        return {"user_id": user["id"], "email": user["email"], "name": user["name"]}
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
    return JSONResponse({
        "status": "success",
        "token": token,
        "user": result
    })

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
    return JSONResponse({
        "status": "success",
        "token": token,
        "user": result
    })

@router.get("/me")
async def me(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return JSONResponse({"status": "error", "message": "Token tidak ada"})
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return JSONResponse({"status": "success", "user": payload})
    except:
        return JSONResponse({"status": "error", "message": "Token invalid"})
