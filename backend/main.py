
# ─── ADMIN: UPGRADE USER MANUAL ───
import os as _os
ADMIN_SECRET = _os.getenv("ADMIN_SECRET", "zenith_admin_2026")

@app.post("/admin/upgrade")
async def admin_upgrade_user(email: str, plan: str = "premium", secret: str = ""):
    if secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        conn = get_db_connection()
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── ADMIN: UPGRADE USER MANUAL ───
import os as _os
ADMIN_SECRET = _os.getenv("ADMIN_SECRET", "zenith_admin_2026")

@app.post("/admin/upgrade")
async def admin_upgrade_user(email: str, plan: str = "premium", secret: str = ""):
    if secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        conn = get_db_connection()
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
