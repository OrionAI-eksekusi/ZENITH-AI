"""
ZANITH AI — Core Config
"""
import os

# AI
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "")
CLAUDE_MODEL   = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-5")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "")


# App
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL  = os.getenv("BACKEND_URL", "http://localhost:8000")
JWT_SECRET   = os.getenv("JWT_SECRET", "zanith-secret-2026")

# ElevenLabs
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "")
