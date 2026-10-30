"""Comprehensive Automated Test Validation Suite for SANDOW Sports Intelligence Platform.
Validates all REST endpoints, MediaPipe Biomechanical Pose Engine,
AI Nutrition & Fuel Planner, and OpenGym-Compatible Coaching Modules.
"""
import sys
import base64
import requests
import numpy as np
import cv2

BASE_URL = "http://127.0.0.1:8000"

def log_test(name: str, passed: bool, detail: str = ""):
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name} {('- ' + detail) if detail else ''}")
    if not passed:
        sys.exit(1)

def run_all_tests():
    print("=" * 65)
    print("SANDOW Sports Intelligence — System Validation Suite")
    print("=" * 65)

    # 1. Health Check
    try:
        r = requests.get(f"{BASE_URL}/api/health", timeout=5)
        log_test("System Health Endpoint", r.status_code == 200 and r.json().get("status") == "healthy", f"HTTP {r.status_code}")
    except Exception as e:
        log_test("System Health Endpoint", False, str(e))

    # 2. Exercises Registry
    try:
        r = requests.get(f"{BASE_URL}/api/exercises", timeout=5)
        drills = r.json()
        log_test("Exercise Registry", r.status_code == 200 and len(drills) >= 6, f"Loaded {len(drills)} exercise drills")
    except Exception as e:
        log_test("Exercise Registry", False, str(e))

    # 3. MediaPipe Real-Time Frame Analysis
    try:
        dummy = np.zeros((300, 300, 3), dtype=np.uint8)
        _, buf = cv2.imencode(".jpg", dummy)
        b64_img = base64.b64encode(buf).decode("utf-8")
        
        r = requests.post(f"{BASE_URL}/api/assessments/analyze-frame", json={
            "image": b64_img,
            "exercise": "Push-ups",
            "session_id": "test_verification_session",
            "reset": True
        }, timeout=8)
        data = r.json()
        log_test("MediaPipe Live Frame Analysis", r.status_code == 200 and "primary_angle" in data, f"Form status: {data.get('form_status')}")
    except Exception as e:
        log_test("MediaPipe Live Frame Analysis", False, str(e))

    # 4. AI Sports Nutrition & Meal Engine
    try:
        r = requests.get(f"{BASE_URL}/api/nutrition/recommendations?exercise=Squats&goal=Hypertrophy", timeout=5)
        data = r.json()
        has_meals = len(data.get("recommended_meals", [])) >= 2
        log_test("AI Sports Nutrition & Fuel Engine", r.status_code == 200 and has_meals, f"Meals tailored for {data.get('workout_type')}")
    except Exception as e:
        log_test("AI Sports Nutrition & Fuel Engine", False, str(e))

    # 5. OpenGym-Style AI Coach Workout Planner
    try:
        r = requests.post(f"{BASE_URL}/api/coach/intake-plan", json={
            "goal": "strength",
            "experience": "intermediate",
            "days_per_week": 4
        }, timeout=5)
        data = r.json()
        log_test("OpenGym AI Coach Workout Planner", r.status_code == 200 and "routines" in data, f"Generated: {data.get('plan_name')}")
    except Exception as e:
        log_test("OpenGym AI Coach Workout Planner", False, str(e))

    # 6. OpenGym-Style Session Debrief
    try:
        r = requests.post(f"{BASE_URL}/api/coach/debrief", json={
            "exercise": "Push-ups",
            "total_reps": 22,
            "accuracy_score": 94.5,
            "duration_seconds": 60.0,
            "faults_detected": ["Slight lumbar curve on rep 18"]
        }, timeout=5)
        data = r.json()
        log_test("OpenGym AI Coach Session Debrief", r.status_code == 200 and data.get("score") == 9, f"Rating: {data.get('score')}/10")
    except Exception as e:
        log_test("OpenGym AI Coach Session Debrief", False, str(e))

    # 7. Athlete Performance Passport
    try:
        r = requests.get(f"{BASE_URL}/api/athletes/ath-1", timeout=5)
        data = r.json()
        log_test("Athlete Passport API", r.status_code == 200 and "profile" in data, f"Athlete: {data.get('profile', {}).get('display_name')}")
    except Exception as e:
        log_test("Athlete Passport API", False, str(e))

    # 8. Coach Command Center & Roster
    try:
        r = requests.get(f"{BASE_URL}/api/coach/coach-1/roster", timeout=5)
        data = r.json()
        log_test("Coach Command Center Roster", r.status_code == 200 and "athletes" in data, f"Roster size: {data.get('roster_count')}")
    except Exception as e:
        log_test("Coach Command Center Roster", False, str(e))

    # 9. Talent Discovery & Regional Scouting
    try:
        r = requests.get(f"{BASE_URL}/api/discovery/athletes", timeout=5)
        data = r.json()
        log_test("Sports Talent Discovery", r.status_code == 200 and len(data.get("results", [])) > 0, f"Found {data.get('total_matches')} candidates")
    except Exception as e:
        log_test("Sports Talent Discovery", False, str(e))

    # 10. Audit Trail
    try:
        r = requests.get(f"{BASE_URL}/api/audit", timeout=5)
        events = r.json()
        log_test("Audit Logging Trail", r.status_code == 200 and isinstance(events, list), f"{len(events)} security events logged")
    except Exception as e:
        log_test("Audit Logging Trail", False, str(e))

    print("=" * 65)
    print("ALL 10 AUTOMATED TEST VALIDATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 65)

if __name__ == "__main__":
    run_all_tests()
