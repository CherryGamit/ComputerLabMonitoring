import time
from datetime import datetime
import csv
import os
import requests

try:
    import pygetwindow as gw
except ImportError:
    gw = None

PC_NUMBER = "PC-02"
CHECK_INTERVAL_SECONDS = 2
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_LOG_FILE = os.path.join(BASE_DIR, "app_session_logs.csv")

# --- NETWORK & SECURITY CONFIGURATION ---
SERVER_IP = "192.168.10.1"
SERVER_PORT = "8000"
API_SERVER_URL = f"http://{SERVER_IP}:{SERVER_PORT}/api/logs"
API_SECURITY_KEY = "LabSecret_ChangeThis_2026"

def get_active_app():
    """Gets the name of the currently active foreground application on Windows."""
    if not gw:
        return "Unknown App"
    try:
        window = gw.getActiveWindow()
        if window and window.title:
            title = window.title.strip()
            if not title:
                return "Idle / Desktop"
            return title
    except Exception:
        pass
    return "Unknown App"

def send_log_to_server(pc_num, app_name, time_in, time_out, duration_seconds):
    """Securely transmits application session data over the local network to the FastAPI backend."""
    headers = {
        "X-API-Key": API_SECURITY_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "pc_number": pc_num,
        "application": app_name,
        "time_in": time_in,
        "time_out": time_out,
        "duration_seconds": duration_seconds
    }
    
    try:
        response = requests.post(API_SERVER_URL, json=payload, headers=headers, timeout=5)
        if response.status_code == 200:
            print("   [Network] Log successfully sent to server database.")
        else:
            print(f"   [Network Warning] Server rejected log: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"   [Network Error] Could not reach server at {API_SERVER_URL}: {e}")

def log_app_session(pc_num, app_name, time_in, time_out, duration_seconds):
    """Saves application usage session locally to CSV and sends it securely to the server."""
    file_exists = os.path.isfile(CSV_LOG_FILE)
    with open(CSV_LOG_FILE, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["PC Number", "Application", "Time In", "Time Out", "Duration (s)"])
        writer.writerow([pc_num, app_name, time_in, time_out, duration_seconds])

    send_log_to_server(pc_num, app_name, time_in, time_out, duration_seconds)

def monitor_applications():
    print(f"[{PC_NUMBER}] Active Process & App Monitor Started...")
    print(f"Target Server: {API_SERVER_URL}")
    print("Tracking open applications and usage durations. (Press Ctrl+C to stop)\n")

    current_app = None
    session_start_time = None

    try:
        while True:
            detected_app = get_active_app()
            now = datetime.now()

            if detected_app != current_app:
                if current_app and session_start_time:
                    time_out_time = now
                    duration = int((time_out_time - session_start_time).total_seconds())
                    
                    if duration >= 2:
                        time_in_str = session_start_time.strftime('%Y-%m-%d %H:%M:%S')
                        time_out_str = time_out_time.strftime('%Y-%m-%d %H:%M:%S')
                        
                        print(f"[{time_out_time.strftime('%H:%M:%S')}] App Closed: '{current_app}' | Duration: {duration}s")
                        log_app_session(PC_NUMBER, current_app, time_in_str, time_out_str, duration)

                current_app = detected_app
                session_start_time = now
                print(f"[{now.strftime('%H:%M:%S')}] App Opened (Time-In): '{current_app}'")

            time.sleep(CHECK_INTERVAL_SECONDS)

    except KeyboardInterrupt:
        if current_app and session_start_time:
            now = datetime.now()
            duration = int((now - session_start_time).total_seconds())
            if duration >= 2:
                log_app_session(
                    PC_NUMBER,
                    current_app,
                    session_start_time.strftime('%Y-%m-%d %H:%M:%S'),
                    now.strftime('%Y-%m-%d %H:%M:%S'),
                    duration
                )
        print("\nProcess Monitoring stopped by user. All active session logs saved and synced.")

if __name__ == "__main__":
    monitor_applications()