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

# Simpan tokens sementara (in-memory)
user_tokens = {}

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
        user_tokens[state] = {
            "token": creds.token,
            "refresh_token": creds.refresh_token,
            "token_uri": creds.token_uri,
            "client_id": creds.client_id,
            "client_secret": creds.client_secret,
        }
        return JSONResponse({"status": "success", "message": "Gmail connected!"})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)})

@router.get("/emails/{user_id}")
async def get_emails(user_id: str, max_results: int = 5):
    """Get latest emails"""
    if user_id not in user_tokens:
        return JSONResponse({"status": "error", "message": "Gmail belum terhubung", "auth_url": f"/gmail/auth/{user_id}"})
    
    try:
        creds_data = user_tokens[user_id]
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
    if user_id not in user_tokens:
        return []
    try:
        creds_data = user_tokens[user_id]
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
