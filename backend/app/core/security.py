"""
ZENITH AI — Security Helpers
JWT verification + SSRF URL guard
"""
import os
import jwt
from fastapi import Request, HTTPException

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET environment variable is not set. Set it in your .env file.")

JWT_ALGORITHM = "HS256"

# Prefix ranges yang diblokir dari browser/scrape (SSRF guard)
_BLOCKED_HOSTS = (
    "localhost",
    "127.",
    "0.",
    "10.",
    "192.168.",
    "172.16.", "172.17.", "172.18.", "172.19.",
    "172.20.", "172.21.", "172.22.", "172.23.",
    "172.24.", "172.25.", "172.26.", "172.27.",
    "172.28.", "172.29.", "172.30.", "172.31.",
    "169.254.",   # AWS/GCP metadata
    "100.64.",    # shared address space
    "::1",
    "fc", "fd",   # IPv6 private
)


def _extract_token(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return ""


def get_current_user(request: Request) -> dict:
    """Validasi JWT dan return payload. Raise 401 jika invalid."""
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Token tidak ada")
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token kadaluarsa")
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalid")


def require_self(request: Request, user_id: str) -> dict:
    """Pastikan token milik user yang sama dengan user_id yang diminta."""
    payload = get_current_user(request)
    if payload.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak")
    return payload


def is_safe_url(url: str) -> bool:
    """Return False jika URL mengarah ke jaringan internal (SSRF guard)."""
    from urllib.parse import urlparse
    try:
        host = (urlparse(url).hostname or "").lower()
    except Exception:
        return False
    for blocked in _BLOCKED_HOSTS:
        if host == blocked.rstrip(".") or host.startswith(blocked):
            return False
    return True
