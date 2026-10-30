"""SQLite Storage and Domain Service for SANDOW Sports Intelligence Platform.
Implements identity, athlete profiles, coach assignments, assessment sessions,
goals, coach notes, consent management, and audit events.
"""
import sqlite3
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Any

DB_PATH = Path(__file__).parent / "sandow.db"

def get_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS athlete_profiles (
        user_id TEXT PRIMARY KEY,
        sport TEXT NOT NULL,
        team TEXT NOT NULL,
        district TEXT NOT NULL,
        state TEXT NOT NULL,
        age_bracket TEXT NOT NULL,
        consent_sharing_coach INTEGER NOT NULL DEFAULT 1,
        consent_sharing_gov INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS coach_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        coach_id TEXT NOT NULL,
        athlete_id TEXT NOT NULL,
        assigned_at TEXT NOT NULL,
        FOREIGN KEY (coach_id) REFERENCES users(id),
        FOREIGN KEY (athlete_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS assessment_sessions (
        id TEXT PRIMARY KEY,
        athlete_id TEXT NOT NULL,
        exercise TEXT NOT NULL,
        estimated_reps REAL,
        posture_label TEXT,
        posture_reason TEXT,
        processing_seconds REAL,
        model_used TEXT,
        observations_json TEXT,
        timeline_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (athlete_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS training_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        athlete_id TEXT NOT NULL,
        creator_id TEXT NOT NULL,
        creator_role TEXT NOT NULL,
        metric_name TEXT NOT NULL,
        target_value TEXT NOT NULL,
        due_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        FOREIGN KEY (athlete_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS coach_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        athlete_id TEXT NOT NULL,
        coach_id TEXT NOT NULL,
        session_id TEXT,
        note_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (athlete_id) REFERENCES users(id),
        FOREIGN KEY (coach_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_id TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)
    conn.commit()

    # Seed baseline user identities if empty
    cursor.execute("SELECT COUNT(*) as count FROM users")
    if cursor.fetchone()["count"] == 0:
        now = datetime.now().isoformat()
        # Seed users
        users = [
            ("ath-1", "Marcus Vance", "marcus.vance@athlete.ai", "athlete", now),
            ("ath-2", "Elena Rostova", "elena.rostova@athlete.ai", "athlete", now),
            ("ath-3", "Jordan Carter", "jordan.carter@athlete.ai", "athlete", now),
            ("coach-1", "Coach R. Sharma", "r.sharma@sports.gov.in", "coach", now),
            ("admin-gov-1", "Director V. Verma (Sports Authority)", "v.verma@sports.gov.in", "sports_admin", now),
            ("admin-sys-1", "System Administrator", "admin@sandow.ai", "platform_admin", now),
        ]
        cursor.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?)", users)

        # Seed athlete profiles
        profiles = [
            ("ath-1", "Track & Field", "National Athletics Academy", "Pune", "Maharashtra", "Under-19", 1, 1),
            ("ath-2", "Gymnastics", "Olympic Training Center", "Bhopal", "Madhya Pradesh", "Senior", 1, 1),
            ("ath-3", "Basketball", "Western Sports Academy", "Mumbai", "Maharashtra", "Under-19", 1, 0),
        ]
        cursor.executemany("INSERT INTO athlete_profiles VALUES (?, ?, ?, ?, ?, ?, ?, ?)", profiles)

        # Seed assignments
        assignments = [
            ("coach-1", "ath-1", now),
            ("coach-1", "ath-2", now),
        ]
        cursor.executemany("INSERT INTO coach_assignments (coach_id, athlete_id, assigned_at) VALUES (?, ?, ?)", assignments)

        # Seed initial training goals
        goals = [
            ("ath-1", "coach-1", "coach", "Repetition Volume (Push-ups)", "15 completed reps", "2026-11-15", "active", now),
            ("ath-1", "ath-1", "athlete", "Biomechanical Form Alignment", "100% Correct Posture", "2026-11-30", "active", now),
        ]
        cursor.executemany("INSERT INTO training_goals (athlete_id, creator_id, creator_role, metric_name, target_value, due_date, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", goals)

        # Initial audit event
        cursor.execute("INSERT INTO audit_events (actor_id, actor_role, action, target, created_at) VALUES (?, ?, ?, ?, ?)",
                       ("admin-sys-1", "platform_admin", "INITIALIZE_SYSTEM", "sandow.db", now))
        conn.commit()

    conn.close()

# User & Role Services
def list_users() -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM users ORDER BY role, display_name").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_user(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

# Athlete Profile & Consent Services
def get_athlete_profile(user_id: str) -> Optional[Dict[str, Any]]:
    # Normalize ID e.g. ath_001 -> ath-1, ath_1 -> ath-1
    normalized_id = user_id.replace("_", "-")
    if normalized_id.startswith("ath-00") or normalized_id.startswith("ath-0"):
        normalized_id = "ath-" + normalized_id.split("-")[-1].lstrip("0")

    conn = get_connection()
    row = conn.execute("""
        SELECT u.id, u.display_name, u.email, u.role, p.sport, p.team, p.district, p.state, p.age_bracket,
               p.consent_sharing_coach, p.consent_sharing_gov
        FROM users u
        JOIN athlete_profiles p ON u.id = p.user_id
        WHERE u.id = ? OR u.id = ?
    """, (user_id, normalized_id)).fetchone()

    if not row:
        # Check if user exists in users table
        u_row = conn.execute("SELECT * FROM users WHERE id = ? OR id = ?", (user_id, normalized_id)).fetchone()
        target_id = user_id if u_row and u_row["id"] == user_id else normalized_id
        if not u_row:
            # Auto-seed athlete user record
            now = datetime.now().isoformat()
            name = f"Athlete {target_id.upper()}"
            if target_id == "ath-1" or target_id == "ath_001":
                name = "Marcus Vance"
            conn.execute("INSERT OR REPLACE INTO users VALUES (?, ?, ?, ?, ?)",
                         (target_id, name, f"{target_id}@athlete.ai", "athlete", now))
        # Ensure athlete profile exists
        conn.execute("""
            INSERT OR REPLACE INTO athlete_profiles 
            (user_id, sport, team, district, state, age_bracket, consent_sharing_coach, consent_sharing_gov)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (target_id, "Track & Field", "National Athletics Academy", "Pune", "Maharashtra", "Under-19", 1, 1))
        conn.commit()
        
        row = conn.execute("""
            SELECT u.id, u.display_name, u.email, u.role, p.sport, p.team, p.district, p.state, p.age_bracket,
                   p.consent_sharing_coach, p.consent_sharing_gov
            FROM users u
            JOIN athlete_profiles p ON u.id = p.user_id
            WHERE u.id = ?
        """, (target_id,)).fetchone()

    conn.close()
    return dict(row) if row else None

def update_athlete_consent(user_id: str, consent_coach: bool, consent_gov: bool):
    conn = get_connection()
    conn.execute("""
        UPDATE athlete_profiles
        SET consent_sharing_coach = ?, consent_sharing_gov = ?
        WHERE user_id = ?
    """, (1 if consent_coach else 0, 1 if consent_gov else 0, user_id))
    now = datetime.now().isoformat()
    conn.execute("INSERT INTO audit_events (actor_id, actor_role, action, target, created_at) VALUES (?, ?, ?, ?, ?)",
                 (user_id, "athlete", "UPDATE_CONSENT", f"coach={consent_coach},gov={consent_gov}", now))
    conn.commit()
    conn.close()

# Assessment Sessions
def save_assessment_session(athlete_id: str, exercise: str, estimated_reps: Optional[float],
                            posture_label: str, posture_reason: str, processing_seconds: float,
                            model_used: str, observations: List[Dict], timeline: Optional[List[Dict]],
                            session_id: Optional[str] = None) -> str:
    conn = get_connection()
    if not session_id:
        session_id = f"sess_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()
    conn.execute("""
        INSERT OR REPLACE INTO assessment_sessions (
            id, athlete_id, exercise, estimated_reps, posture_label, posture_reason,
            processing_seconds, model_used, observations_json, timeline_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        session_id, athlete_id, exercise, estimated_reps, posture_label, posture_reason,
        processing_seconds, model_used, json.dumps(observations or []),
        json.dumps(timeline or []), now
    ))
    conn.execute("INSERT INTO audit_events (actor_id, actor_role, action, target, created_at) VALUES (?, ?, ?, ?, ?)",
                 (athlete_id, "athlete", "RECORD_ASSESSMENT", session_id, now))
    conn.commit()
    conn.close()
    return session_id

def get_athlete_sessions(athlete_id: str) -> List[Dict[str, Any]]:
    norm_id = athlete_id.replace("_", "-")
    if norm_id.startswith("ath-00") or norm_id.startswith("ath-0"):
        norm_id = "ath-" + norm_id.split("-")[-1].lstrip("0")

    conn = get_connection()
    rows = conn.execute("""
        SELECT * FROM assessment_sessions
        WHERE athlete_id = ? OR athlete_id = ?
        ORDER BY created_at DESC
    """, (athlete_id, norm_id)).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["observations"] = json.loads(d.get("observations_json") or "[]")
        d["timeline"] = json.loads(d.get("timeline_json") or "[]")
        result.append(d)
    return result

# Coach Services
def get_coach_assigned_athletes(coach_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("""
        SELECT u.id, u.display_name, u.email, p.sport, p.team, p.district, p.state, p.age_bracket,
               p.consent_sharing_coach
        FROM coach_assignments ca
        JOIN users u ON ca.athlete_id = u.id
        JOIN athlete_profiles p ON u.id = p.user_id
        WHERE ca.coach_id = ?
        ORDER BY u.display_name
    """, (coach_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_coach_note(coach_id: str, athlete_id: str, note_text: str, session_id: Optional[str] = None):
    conn = get_connection()
    now = datetime.now().isoformat()
    conn.execute("""
        INSERT INTO coach_notes (athlete_id, coach_id, session_id, note_text, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (athlete_id, coach_id, session_id, note_text, now))
    conn.execute("INSERT INTO audit_events (actor_id, actor_role, action, target, created_at) VALUES (?, ?, ?, ?, ?)",
                 (coach_id, "coach", "ADD_COACH_NOTE", f"athlete={athlete_id}", now))
    conn.commit()
    conn.close()

def get_coach_notes(athlete_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("""
        SELECT cn.*, u.display_name as coach_name
        FROM coach_notes cn
        JOIN users u ON cn.coach_id = u.id
        WHERE cn.athlete_id = ?
        ORDER BY cn.created_at DESC
    """, (athlete_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Training Goals
def get_athlete_goals(athlete_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("""
        SELECT * FROM training_goals
        WHERE athlete_id = ?
        ORDER BY created_at DESC
    """, (athlete_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

list_training_goals = get_athlete_goals

def add_training_goal(athlete_id: str, creator_id: str, creator_role: str, metric_name: str, target_value: str, due_date: str):
    conn = get_connection()
    now = datetime.now().isoformat()
    conn.execute("""
        INSERT INTO training_goals (athlete_id, creator_id, creator_role, metric_name, target_value, due_date, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
    """, (athlete_id, creator_id, creator_role, metric_name, target_value, due_date, now))
    conn.execute("INSERT INTO audit_events (actor_id, actor_role, action, target, created_at) VALUES (?, ?, ?, ?, ?)",
                 (creator_id, creator_role, "CREATE_GOAL", f"athlete={athlete_id}", now))
    conn.commit()
    conn.close()

# Talent Discovery & Government Analytics
def get_talent_pool(sport: Optional[str] = None, state: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    query = """
        SELECT u.id, u.display_name, p.sport, p.team, p.district, p.state, p.age_bracket,
               COUNT(s.id) as sessions_count,
               AVG(s.estimated_reps) as avg_reps,
               MAX(s.estimated_reps) as max_reps
        FROM users u
        JOIN athlete_profiles p ON u.id = p.user_id
        LEFT JOIN assessment_sessions s ON u.id = s.athlete_id
        WHERE p.consent_sharing_gov = 1
    """
    params = []
    if sport and sport != "All Sports":
        query += " AND p.sport = ?"
        params.append(sport)
    if state and state != "All States":
        query += " AND p.state = ?"
        params.append(state)
    query += " GROUP BY u.id ORDER BY max_reps DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

get_talent_discovery_data = get_talent_pool

# Audit Events
def get_audit_log(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    rows = conn.execute("SELECT * FROM audit_events ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

get_audit_events = get_audit_log

# Initialize schema on module import
init_db()
