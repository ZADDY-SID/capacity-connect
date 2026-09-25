import json
from app import create_app
from models import db, User, Course, Module, Enrollment, ModuleProgress, Quiz, Question, QuizAttempt, Certificate

def test_endpoints():
    app = create_app()
    client = app.test_client()

    print("\n--- 1. Testing Health ---")
    res = client.get("/api/health")
    assert res.status_code == 200
    print("Health check OK:", res.get_json())

    print("\n--- 2. Testing Trainee Login ---")
    res = client.post("/api/auth/login", json={
        "email": "trainee@capacityconnect.com",
        "password": "trainee123"
    })
    assert res.status_code == 200, res.get_data(as_text=True)
    trainee_data = res.get_json()["user"]
    print("Trainee logged in:", trainee_data["name"], f"({trainee_data['role']})")

    print("\n--- 3. Testing Courses List & Detail ---")
    res = client.get("/api/courses")
    assert res.status_code == 200
    courses = res.get_json()["courses"]
    assert len(courses) >= 4
    py_course = next(c for c in courses if "Python" in c["title"])
    print(f"Found {len(courses)} courses. Python course ID:", py_course["id"])

    res = client.get(f"/api/courses/{py_course['id']}")
    assert res.status_code == 200
    detail = res.get_json()["course"]
    print(f"Course detail has {len(detail['modules'])} modules.")
    assert len(detail["modules"]) == 6

    print("\n--- 4. Testing Module Completion ---")
    # Complete module 3
    mod3 = detail["modules"][2]
    res = client.post(f"/api/modules/{mod3['id']}/complete", json={"completed": True})
    assert res.status_code == 200
    print("Module 3 marked complete:", res.get_json())

    print("\n--- 5. Testing Quiz Fetch & Submission ---")
    res = client.get(f"/api/quizzes/course/{py_course['id']}")
    assert res.status_code == 200
    quiz_data = res.get_json()["quiz"]
    print(f"Quiz '{quiz_data['title']}' loaded with {len(quiz_data['questions'])} questions.")

    # Submit with correct answers: B, C, A, C, B
    answers = {}
    correct_keys = ["B", "C", "A", "C", "B"]
    for idx, q in enumerate(quiz_data["questions"]):
        answers[str(q["id"])] = correct_keys[idx]

    # Also mark all remaining modules complete to unlock certificate
    for mod in detail["modules"]:
        client.post(f"/api/modules/{mod['id']}/complete", json={"completed": True})

    res = client.post(f"/api/quizzes/{quiz_data['id']}/submit", json={"answers": answers})
    assert res.status_code == 200, res.get_data(as_text=True)
    result = res.get_json()["result"]
    print(f"Quiz submitted: Score {result['score']}/{result['max_score']} ({result['percentage']}%), Passed: {result['passed']}")
    assert result["passed"] is True
    print("Certificate generated?", result.get("certificate_generated"))

    print("\n--- 6. Testing Certificates API ---")
    res = client.get("/api/certificates")
    assert res.status_code == 200
    certs = res.get_json()["certificates"]
    print(f"Trainee has {len(certs)} certificate(s):", [c["course_title"] for c in certs])
    assert len(certs) >= 1

    print("\n--- 7. Testing Trainee Dashboard Stats ---")
    res = client.get("/api/trainee/dashboard")
    assert res.status_code == 200
    t_dash = res.get_json()
    print("Trainee stats:", t_dash["stats"])

    print("\n--- 8. Testing Trainer Login & Student Performance ---")
    client.post("/api/auth/logout")
    res = client.post("/api/auth/login", json={
        "email": "trainer@capacityconnect.com",
        "password": "trainer123"
    })
    assert res.status_code == 200
    print("Trainer logged in:", res.get_json()["user"]["name"])

    res = client.get("/api/trainer/students")
    assert res.status_code == 200
    students = res.get_json()["students"]
    print(f"Trainer sees {len(students)} student enrollments.")
    needs_attn = [s for s in students if s["needs_attention"]]
    print(f"Students with 'Needs Attention' flag: {len(needs_attn)} (e.g. {needs_attn[0]['student_name'] if needs_attn else 'None'})")
    assert len(needs_attn) >= 1

    res = client.get("/api/trainer/analytics")
    assert res.status_code == 200
    t_analytics = res.get_json()
    print("Trainer analytics stats:", t_analytics["stats"])

    print("\n--- 9. Testing Admin Login & Analytics ---")
    client.post("/api/auth/logout")
    res = client.post("/api/auth/login", json={
        "email": "admin@capacityconnect.com",
        "password": "admin123"
    })
    assert res.status_code == 200
    print("Admin logged in:", res.get_json()["user"]["name"])

    res = client.get("/api/admin/users")
    assert res.status_code == 200
    users = res.get_json()["users"]
    print(f"Admin sees {len(users)} users.")

    res = client.get("/api/admin/analytics")
    assert res.status_code == 200
    adm_analytics = res.get_json()
    print("Admin analytics overview:", adm_analytics["stats"])

    print("\nAll backend smoke tests PASSED successfully!\n")

if __name__ == "__main__":
    test_endpoints()
