"""
ZENITH AI — Calendar Router
Google Calendar integration
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from app.routers.gmail import _get_token
from datetime import datetime, timedelta
import pytz

router = APIRouter(prefix="/calendar", tags=["calendar"])

def get_credentials(user_id: str):
    creds_data = _get_token(user_id)
    if not creds_data:
        return None
    return Credentials(
        token=creds_data["token"],
        refresh_token=creds_data.get("refresh_token"),
        token_uri=creds_data.get("token_uri"),
        client_id=creds_data.get("client_id"),
        client_secret=creds_data.get("client_secret"),
    )

async def get_events_data(user_id: str, days: int = 7) -> list:
    """Get calendar events untuk AI context"""
    creds = get_credentials(user_id)
    if not creds:
        return []
    try:
        service = build("calendar", "v3", credentials=creds)
        now = datetime.utcnow().isoformat() + "Z"
        end = (datetime.utcnow() + timedelta(days=days)).isoformat() + "Z"
        events_result = service.events().list(
            calendarId="primary",
            timeMin=now,
            timeMax=end,
            maxResults=10,
            singleEvents=True,
            orderBy="startTime"
        ).execute()
        events = events_result.get("items", [])
        result = []
        for e in events:
            start = e["start"].get("dateTime", e["start"].get("date", ""))
            result.append({
                "title": e.get("summary", "No title"),
                "start": start,
                "location": e.get("location", ""),
                "description": e.get("description", "")[:100]
            })
        return result
    except Exception as ex:
        print(f"[CALENDAR ERROR] {ex}")
        return []

@router.get("/events/{user_id}")
async def get_events(user_id: str, days: int = 7):
    events = await get_events_data(user_id, days)
    if not events:
        return JSONResponse({"status": "error", "message": "Calendar belum terhubung atau tidak ada event"})
    return JSONResponse({"status": "success", "events": events})
