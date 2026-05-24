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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import chat, voice, gmail, auth, notes
app.include_router(chat.router)
app.include_router(voice.router)
app.include_router(gmail.router)
app.include_router(auth.router)
app.include_router(notes.router)

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
