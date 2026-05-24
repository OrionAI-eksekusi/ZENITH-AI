"""
ZENITH AI — Usage Limits
Trial: 10 perintah/hari, 3 hari
Premium: 20 perintah/hari
"""
from app.core.database import get_conn
from datetime import date

LIMITS = {
    "trial": 10,
    "premium": 20
}
TRIAL_DAYS = 3

def check_and_increment(user_id: str) -> dict:
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute("SELECT plan, commands_today, last_reset, trial_start FROM zenith_users WHERE user_id = %s", (user_id,))
        user = c.fetchone()
        
        if not user:
            return {"allowed": True}
        
        today = date.today()
        plan = user["plan"] or "trial"
        trial_start = user["trial_start"] or today
        last_reset = user["last_reset"] or today
        commands_today = user["commands_today"] or 0

        # Cek trial expired
        if plan == "trial":
            days_since = (today - trial_start).days
            if days_since >= TRIAL_DAYS:
                return {
                    "allowed": False,
                    "reason": "trial_expired",
                    "message": "Trial 3 hari kamu sudah habis Bos! Upgrade ke Premium Rp 130rb/bulan untuk lanjut."
                }

        # Reset harian
        if last_reset < today:
            commands_today = 0
            c.execute("UPDATE zenith_users SET commands_today = 0, last_reset = %s WHERE user_id = %s", (today, user_id))
            conn.commit()

        # Cek limit harian
        limit = LIMITS.get(plan, 10)
        if commands_today >= limit:
            return {
                "allowed": False,
                "reason": "daily_limit",
                "message": f"Kamu sudah mencapai batas {limit} perintah hari ini Bos! {'Upgrade ke Premium' if plan == 'trial' else 'Limit reset besok'} ya."
            }

        # Increment
        c.execute("UPDATE zenith_users SET commands_today = commands_today + 1 WHERE user_id = %s", (user_id,))
        conn.commit()

        return {
            "allowed": True,
            "plan": plan,
            "commands_used": commands_today + 1,
            "commands_limit": limit
        }
    finally:
        conn.close()
