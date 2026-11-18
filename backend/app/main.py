import os
import mysql.connector
from fastapi import FastAPI, Header, HTTPException, Depends
from pydantic import BaseModel

app = FastAPI(
    title="Computer Laboratory Monitoring API",
    description="Backend API for laboratory monitoring",
    version="1.0.0",
)

SECRET_API_KEY = os.getenv("API_SECRET_KEY", "LabSecret_ChangeThis_2026")

def verify_api_key(x_api_key: str = Header(...)):
    """Validates the security header sent by client PCs."""
    if x_api_key != SECRET_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing API Key")
    return x_api_key

class SessionLogPayload(BaseModel):
    pc_number: str
    application: str
    time_in: str
    time_out: str
    duration_seconds: int

def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "3308")),
        user=os.getenv("DB_USER", "lab_app"),
        password=os.getenv("DB_PASSWORD", "LabApp_ChangeThis_2026"),
        database=os.getenv("DB_NAME", "lab_monitoring_db"),
        use_pure=True,
        connection_timeout=30
    )

@app.get("/")
def home():
    return {"message": "Computer Laboratory Monitoring API is running"}

@app.get("/health")
def health():
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        connection.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/pc-units")
def get_pc_units():
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM pc_units")
        units = cursor.fetchall()
        cursor.close()
        connection.close()
        return {"pc_units": units}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/logs")
def get_activity_logs(limit: int = 50):
    """Fetches the most recent workstation activity logs joined with pc_number."""
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT 
                a.application_log_id AS id,
                p.pc_number,
                a.application_name AS application,
                a.started_at AS time_in,
                a.ended_at AS time_out,
                a.duration_seconds
            FROM application_logs a
            JOIN session_logs s ON a.session_id = s.session_id
            JOIN pc_units p ON s.pc_id = p.pc_id
            ORDER BY a.application_log_id DESC
            LIMIT %s
        """
        cursor.execute(query, (limit,))
        logs = cursor.fetchall()
        cursor.close()
        connection.close()
        return {"total": len(logs), "logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/logs", dependencies=[Depends(verify_api_key)])
def receive_activity_log(payload: SessionLogPayload):
    """Auto-resolves pc_unit & active session, then stores the log in application_logs."""
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        # 1. Ensure pc_number exists in pc_units (auto-register new PCs like PC-02)
        cursor.execute("SELECT pc_id FROM pc_units WHERE pc_number = %s", (payload.pc_number,))
        pc_row = cursor.fetchone()
        if pc_row:
            pc_id = pc_row["pc_id"]
            cursor.execute("UPDATE pc_units SET pc_status = 'in_use' WHERE pc_id = %s", (pc_id,))
        else:
            cursor.execute(
                "INSERT INTO pc_units (pc_number, pc_status) VALUES (%s, 'in_use')",
                (payload.pc_number,)
            )
            pc_id = cursor.lastrowid

        # 2. Get active session for this PC, or create one automatically
        cursor.execute(
            "SELECT session_id FROM session_logs WHERE pc_id = %s AND session_status = 'active' ORDER BY session_id DESC LIMIT 1",
            (pc_id,)
        )
        session_row = cursor.fetchone()
        if session_row:
            session_id = session_row["session_id"]
        else:
            cursor.execute(
                "INSERT INTO session_logs (pc_id, time_in, session_status) VALUES (%s, %s, 'active')",
                (pc_id, payload.time_in)
            )
            session_id = cursor.lastrowid

        # 3. Insert the activity record into application_logs
        cursor.execute(
            """
            INSERT INTO application_logs (session_id, application_name, started_at, ended_at, duration_seconds)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (session_id, payload.application, payload.time_in, payload.time_out, payload.duration_seconds)
        )

        connection.commit()
        cursor.close()
        connection.close()

        return {"status": "success", "message": "Log recorded securely in database."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000)