"""
ZANITH AI — Gmail Router
"""
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, RedirectResponse
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import os
import json

router = APIRouter(prefix="/gmail", tags=["gmail"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
BACKEND_URL = os.getenv("BACKEND_URL", "https://zenith-ai-production-c5d7.up.railway.app")

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

from app.core.database import get_conn
import json as json_lib

def _save_token(user_id: str, token_data: dict):
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("""
            INSERT INTO zanith_memory (user_id, key, value, category, updated_at)
            VALUES (%s, 'gmail_token', %s, 'auth', NOW())
            ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value, updated_at = NOW()
        """, (user_id, json_lib.dumps(token_data)))
        conn.commit()
    finally:
        conn.close()

def _get_token(user_id: str) -> dict:
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("SELECT value FROM zanith_memory WHERE user_id = %s AND key = 'gmail_token'", (user_id,))
        row = c.fetchone()
        return json_lib.loads(row['value']) if row else None
    finally:
        conn.close()

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

@router.get("/auth/{user_id}")
async def gmail_auth(user_id: str):
    """Start Gmail OAuth flow"""
    flow = get_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        state=user_id
    )
    return RedirectResponse(auth_url)

@router.get("/callback")
async def gmail_callback(code: str, state: str):
    """Handle Gmail OAuth callback"""
    try:
        flow = get_flow()
        flow.fetch_token(code=code)
        creds = flow.credentials
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

@router.get("/emails/{user_id}")
async def get_emails(user_id: str, max_results: int = 5):
    """Get latest emails"""
    creds_data = _get_token(user_id)
    if not creds_data:
        return JSONResponse({"status": "error", "message": "Gmail belum terhubung", "auth_url": f"/gmail/auth/{user_id}"})
    
    try:
        creds = Credentials(
            token=creds_data["token"],
            refresh_token=creds_data["refresh_token"],
            token_uri=creds_data["token_uri"],
            client_id=creds_data["client_id"],
            client_secret=creds_data["client_secret"],
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

async def get_emails_data(user_id: str, max_results: int = 5) -> list:
    """Get emails as list for AI context"""
    creds_data = _get_token(user_id)
    if not creds_data:
        return []
    try:
        creds = Credentials(
            token=creds_data["token"],
            refresh_token=creds_data["refresh_token"],
            token_uri=creds_data["token_uri"],
            client_id=creds_data["client_id"],
            client_secret=creds_data["client_secret"],
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
