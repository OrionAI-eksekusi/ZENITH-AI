"""
ZENITH AI — Autonomous Intelligence OS
Backend Core v1.0
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging
import os

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 ZENITH AI starting...")
    from app.core.database import init_db
    await init_db()
    logger.info("✅ ZENITH AI ready")
    yield
    logger.info("👋 ZENITH AI shutdown")

app = FastAPI(
    title="ZENITH AI",
    description="Autonomous Intelligence Operating System",
    version="1.0.0",
    lifespan=lifespan
)

_cors_origins_env = os.getenv("CORS_ORIGINS", "")
_allowed_origins = [o.strip() for o in _cors_origins_env.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import chat, voice, gmail, auth, notes, calendar, browser, presence
app.include_router(chat.router)
app.include_router(voice.router)
app.include_router(gmail.router)
app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(calendar.router)
app.include_router(browser.router)
app.include_router(presence.router)

@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    import traceback
    logger.error(f"[ERROR] {request.url}: {traceback.format_exc()}")
    return JSONResponse(status_code=500, content={"status": "error", "message": str(exc)})

@app.get("/")
async def root():
    return {"status": "ZENITH online 🚀", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ZENITH AI"}

# ─── ADMIN: UPGRADE USER MANUAL ───
@app.post("/admin/upgrade")
async def admin_upgrade_user(email: str, plan: str = "premium", secret: str = ""):
    import os
    if not secret or secret != os.getenv("ADMIN_SECRET", ""):
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        from app.core.database import get_conn
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("UPDATE zenith_users SET plan = %s WHERE email = %s RETURNING email", (plan, email))
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        if result:
            return {"status": "success", "message": f"{email} upgraded to {plan}"}
        else:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
