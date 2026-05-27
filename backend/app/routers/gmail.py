"""
ZENITH AI — Gmail Router
"""
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, RedirectResponse
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from app.core.database import get_conn
import os
import json as json_lib
import httpx
import jwt
import hashlib
import random
from datetime import datetime, timedelta

router = APIRouter(prefix="/gmail", tags=["gmail"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
BACKEND_URL = os.getenv("BACKEND_URL", "https://zenith-ai-production-c5d7.up.railway.app")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://zenith-ai-gules.vercel.app")
JWT_SECRET = os.getenv("JWT_SECRET", "zenith-secret-2026")

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/calendar.readonly",
    "openid"
]

def get_flow():
    return Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [f"{BACKEND_URL}/gmail/callback"]
            }
        },
        scopes=SCOPES,
        redirect_uri=f"{BACKEND_URL}/gmail/callback"
    )

def _save_token(user_id: str, token_data: dict):
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("""
            INSERT INTO zenith_memory (user_id, key, value, category, updated_at)
            VALUES (%s, 'gmail_token', %s, 'auth', NOW())
            ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value, updated_at = NOW()
        """, (user_id, json_lib.dumps(token_data)))
        conn.commit()
    finally:
        conn.close()

def _get_token(user_id: str):
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("SELECT value FROM zenith_memory WHERE user_id = %s AND key = 'gmail_token'", (user_id,))
        row = c.fetchone()
        return json_lib.loads(row['value']) if row else None
    finally:
        conn.close()

def _get_or_create_user(email: str, name: str) -> str:
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("SELECT user_id FROM zenith_users WHERE email = %s", (email,))
        existing = c.fetchone()
        if existing:
            return str(existing["user_id"])
        user_id = str(random.randint(100000, 999999))
        c.execute("""
            INSERT INTO zenith_users (user_id, email, name, password_hash, created_at)
            VALUES (%s, %s, %s, %s, NOW())
        """, (user_id, email, name, hashlib.sha256(b"google_oauth").hexdigest()))
        conn.commit()
        return user_id
    finally:
        conn.close()

@router.get("/auth/{user_id}")
async def gmail_auth(user_id: str):
    flow = get_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=user_id
    )
    return RedirectResponse(auth_url)

@router.get("/login")
async def google_login():
    flow = get_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state="google_login"
    )
    return RedirectResponse(auth_url)

@router.get("/callback")
async def gmail_callback(code: str, state: str):
    try:
        flow = get_flow()
        flow.fetch_token(code=code)
        creds = flow.credentials

        is_desktop = "desktop" in state
        if "google_login" in state:
            async with httpx.AsyncClient() as http:
                resp = await http.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {creds.token}"}
                )
                user_info = resp.json()

            email = user_info.get("email", "")
            name = user_info.get("name", email.split("@")[0])
            user_id = _get_or_create_user(email, name)

            _save_token(user_id, {
                "token": creds.token,
                "refresh_token": creds.refresh_token,
                "token_uri": creds.token_uri,
                "client_id": creds.client_id,
                "client_secret": creds.client_secret,
            })

            token = jwt.encode({
                "user_id": user_id,
                "email": email,
                "exp": datetime.utcnow() + timedelta(days=30)
            }, JWT_SECRET, algorithm="HS256")

            if is_desktop:
                return RedirectResponse(
                    f"zenith://auth?token={token}&user_id={user_id}&name={name}&email={email}"
                )
            return RedirectResponse(
                f"{FRONTEND_URL}/auth/callback?token={token}&user_id={user_id}&name={name}&email={email}"
            )

        _save_token(state, {
            "token": creds.token,
            "refresh_token": creds.refresh_token,
            "token_uri": creds.token_uri,
            "client_id": creds.client_id,
            "client_secret": creds.client_secret,
        })
        return JSONResponse({"status": "success", "message": "Gmail connected!"})

    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)})

@router.post("/send")
async def send_email_endpoint(request: Request):
    data = await request.json()
    user_id = data.get("user_id", "")
    to = data.get("to", "")
    subject = data.get("subject", "")
    body = data.get("body", "")
    if not all([user_id, to, body]):
        return JSONResponse({"status": "error", "message": "Field tidak lengkap"})
    result = await send_email(user_id, to, subject, body)
    return JSONResponse(result)

@router.get("/emails/{user_id}")
async def get_emails(user_id: str, max_results: int = 5):
    creds_data = _get_token(user_id)
    if not creds_data:
        return JSONResponse({"status": "error", "message": "Gmail belum terhubung", "auth_url": f"/gmail/auth/{user_id}"})
    try:
        creds = Credentials(
            token=creds_data["token"],
            refresh_token=creds_data.get("refresh_token"),
            token_uri=creds_data.get("token_uri"),
            client_id=creds_data.get("client_id"),
            client_secret=creds_data.get("client_secret"),
        )
        service = build("gmail", "v1", credentials=creds)
        results = service.users().messages().list(
            userId="me", maxResults=max_results, labelIds=["INBOX"]
        ).execute()
        messages = results.get("messages", [])
        emails = []
        for msg in messages:
            detail = service.users().messages().get(
                userId="me", id=msg["id"], format="metadata",
                metadataHeaders=["From", "Subject", "Date"]
            ).execute()
            headers = {h["name"]: h["value"] for h in detail.get("payload", {}).get("headers", [])}
            emails.append({
                "id": msg["id"],
                "from": headers.get("From", ""),
                "subject": headers.get("Subject", ""),
                "date": headers.get("Date", ""),
                "snippet": detail.get("snippet", "")[:200]
            })
        return JSONResponse({"status": "success", "emails": emails})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)})

async def send_email(user_id: str, to: str, subject: str, body: str) -> dict:
    """Kirim email dari Gmail user"""
    creds_data = _get_token(user_id)
    if not creds_data:
        return {"status": "error", "message": "Gmail belum terhubung"}
    try:
        import base64
        from email.mime.text import MIMEText
        creds = Credentials(
            token=creds_data["token"],
            refresh_token=creds_data.get("refresh_token"),
            token_uri=creds_data.get("token_uri"),
            client_id=creds_data.get("client_id"),
            client_secret=creds_data.get("client_secret"),
        )
        service = build("gmail", "v1", credentials=creds)
        message = MIMEText(body)
        message["to"] = to
        message["subject"] = subject
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        service.users().messages().send(userId="me", body={"raw": raw}).execute()
        return {"status": "success", "message": f"Email terkirim ke {to}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

async def send_email(user_id: str, to: str, subject: str, body: str) -> dict:
    """Kirim email dari Gmail user"""
    creds_data = _get_token(user_id)
    if not creds_data:
        return {"status": "error", "message": "Gmail belum terhubung"}
    try:
        import base64
        from email.mime.text import MIMEText
        creds = Credentials(
            token=creds_data["token"],
            refresh_token=creds_data.get("refresh_token"),
            token_uri=creds_data.get("token_uri"),
            client_id=creds_data.get("client_id"),
            client_secret=creds_data.get("client_secret"),
        )
        service = build("gmail", "v1", credentials=creds)
        message = MIMEText(body)
        message["to"] = to
        message["subject"] = subject
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        service.users().messages().send(userId="me", body={"raw": raw}).execute()
        return {"status": "success", "message": f"Email terkirim ke {to}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

async def get_emails_data(user_id: str, max_results: int = 5) -> list:
    creds_data = _get_token(user_id)
    if not creds_data:
        return []
    try:
        creds = Credentials(
            token=creds_data["token"],
            refresh_token=creds_data.get("refresh_token"),
            token_uri=creds_data.get("token_uri"),
            client_id=creds_data.get("client_id"),
            client_secret=creds_data.get("client_secret"),
        )
        service = build("gmail", "v1", credentials=creds)
        results = service.users().messages().list(
            userId="me", maxResults=max_results, labelIds=["INBOX"]
        ).execute()
        messages = results.get("messages", [])
        emails = []
        for msg in messages:
            detail = service.users().messages().get(
                userId="me", id=msg["id"], format="metadata",
                metadataHeaders=["From", "Subject", "Date"]
            ).execute()
            headers = {h["name"]: h["value"] for h in detail.get("payload", {}).get("headers", [])}
            emails.append({
                "from": headers.get("From", ""),
                "subject": headers.get("Subject", ""),
                "date": headers.get("Date", ""),
                "snippet": detail.get("snippet", "")[:200]
            })
        return emails
    except:
        return []
