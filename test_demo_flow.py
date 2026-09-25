import urllib.request
import urllib.parse
import http.cookiejar
import json
import sys

BASE_URL = "http://127.0.0.1:5000"
PROXY_URL = "http://localhost:5173"

def create_client():
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    return opener

def request(opener, method, path, data=None, use_proxy=False):
    base = PROXY_URL if use_proxy else BASE_URL
    url = f"{base}{path}"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with opener.open(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            err_json = json.loads(content)
        except:
            err_json = {"raw": content}
        return e.code, err_json

def run_hackathon_demo_flow():
    print("=" * 60)
    print("STARTING HACKATHON DEMO END-TO-END VERIFICATION")
    print("=" * 60)

    # 1. Test Proxy and Backend Connectivity
    client = create_client()
    status, health = request(client, "GET", "/api/health", use_proxy=True)
    print(f"\n[1] Vite Proxy Health Check: Status {status} -> {health}")
    assert status == 200, f"Proxy failed: {health}"

    # -------------------------------------------------------------
    # 2. TRAINER DEMO FLOW
    # -------------------------------------------------------------
    print("\n" + "-" * 50)
    print("DEMO STEP 1: TRAINER LOGIN & COURSE/QUIZ MANAGEMENT")
    print("-" * 50)
    status, res = request(client, "POST", "/api/auth/login", {
        "email": "trainer@capacityconnect.com",
        "password": "trainer123"
    }, use_proxy=True)
    print(f"Trainer Login: Status {status}, Logged in as: {res['user']['name']} ({res['user']['role']})")
    assert status == 200

    # Get Trainer courses
    status, courses_res = request(client, "GET", "/api/courses?mine=true", use_proxy=True)
    py_course = next(c for c in courses_res["courses"] if "Python" in c["title"])
    print(f"Trainer authored course: '{py_course['title']}' (ID: {py_course['id']}) with {py_course['module_count']} modules")

    # Trainer adds a supplemental practical exercise module
    status, new_mod_res = request(client, "POST", f"/api/courses/{py_course['id']}/modules", {
        "title": "Hands-On Capstone Project",
        "description": "Build a modular CLI task manager in Python.",
        "content": "# Capstone: Python Task Manager\n\nCombine data structures, loops, and functions...",
        "key_points": ["Modular code separation", "Clean input sanitization", "File persistence"],
        "material_url": "https://docs.python.org/3/tutorial/",
        "duration_minutes": 45
    }, use_proxy=True)
    print(f"Added Capstone Module: Status {status}, New Module ID: {new_mod_res['module']['id']}")
    assert status == 201

    # Trainer reviews Student Performance Table (and verifies "Needs Attention" rule)
    status, students_res = request(client, "GET", "/api/trainer/students", use_proxy=True)
    students = students_res["students"]
    print(f"Trainer inspecting performance of {len(students)} enrolled students:")
    for st in students:
        badge = " [NEEDS ATTENTION]" if st["needs_attention"] else f" [{st['status']}]"
        print(f"  • {st['student_name']} -> Course: {st['course_title'][:20]}... | Progress: {st['progress']}% | Score: {st['quiz_score']}{badge}")

    assert any(st["needs_attention"] for st in students), "Needs Attention detection should be present!"
    print("Trainer student performance check complete.")

    # Trainer Logout
    status, _ = request(client, "POST", "/api/auth/logout", use_proxy=True)
    print("Trainer logged out.")

    # -------------------------------------------------------------
    # 3. TRAINEE DEMO FLOW
    # -------------------------------------------------------------
    print("\n" + "-" * 50)
    print("DEMO STEP 2: TRAINEE LOGIN, LEARNING & CERTIFICATION")
    print("-" * 50)
    trainee_client = create_client()
    status, res = request(trainee_client, "POST", "/api/auth/login", {
        "email": "trainee@capacityconnect.com",
        "password": "trainee123"
    }, use_proxy=True)
    print(f"Trainee Login: Status {status}, Logged in as: {res['user']['name']} ({res['user']['role']})")
    assert status == 200

    # Browse courses
    status, catalog = request(trainee_client, "GET", "/api/courses", use_proxy=True)
    print(f"Trainee browsed catalog, found {len(catalog['courses'])} published courses.")

    # View course detail & curriculum
    status, detail = request(trainee_client, "GET", f"/api/courses/{py_course['id']}", use_proxy=True)
    course_data = detail["course"]
    print(f"Trainee opened '{course_data['title']}' with {len(course_data['modules'])} modules.")

    # Trainee completes all remaining modules
    for mod in course_data["modules"]:
        status, mod_res = request(trainee_client, "POST", f"/api/modules/{mod['id']}/complete", {"completed": True}, use_proxy=True)
        assert status == 200

    print(f"All {len(course_data['modules'])} modules marked completed. Recalculated progress: 100%")

    # Trainee takes certification quiz
    status, qz_res = request(trainee_client, "GET", f"/api/quizzes/course/{py_course['id']}", use_proxy=True)
    quiz = qz_res["quiz"]
    print(f"Trainee started quiz: '{quiz['title']}' ({len(quiz['questions'])} questions)")

    # Submit with answers (Option B, C, A, C, B)
    answers = {}
    correct_options = ["B", "C", "A", "C", "B"]
    for i, q in enumerate(quiz["questions"]):
        opt = correct_options[i % len(correct_options)]
        answers[str(q["id"])] = opt

    status, submit_res = request(trainee_client, "POST", f"/api/quizzes/{quiz['id']}/submit", {"answers": answers}, use_proxy=True)
    result = submit_res["result"]
    print(f"Quiz submitted: Score {result['score']}/{result['max_score']} ({result['percentage']}%), Passed: {result['passed']}")
    assert result["passed"] is True
    print(f"Certificate generated dynamically? {result['certificate_generated']}")
    assert result.get("certificate") is not None
    cert = result["certificate"]
    print(f"OFFICIAL CERTIFICATE UNLOCKED: Code '{cert['certificate_code']}' awarded to {cert['trainee_name']}")

    # Verify certificate in Trainee's certificate list
    status, certs_list = request(trainee_client, "GET", "/api/certificates", use_proxy=True)
    print(f"Trainee now holds {len(certs_list['certificates'])} verified certificates:")
    for c in certs_list["certificates"]:
        print(f"  • {c['course_title']} (Issued: {c['issue_date']}, Code: {c['certificate_code']})")

    # Trainee Logout
    status, _ = request(trainee_client, "POST", "/api/auth/logout", use_proxy=True)
    print("Trainee logged out.")

    # -------------------------------------------------------------
    # 4. ADMIN DEMO FLOW
    # -------------------------------------------------------------
    print("\n" + "-" * 50)
    print("DEMO STEP 3: ADMIN LOGIN, GOVERNANCE & ANALYTICS")
    print("-" * 50)
    admin_client = create_client()
    status, res = request(admin_client, "POST", "/api/auth/login", {
        "email": "admin@capacityconnect.com",
        "password": "admin123"
    }, use_proxy=True)
    print(f"Admin Login: Status {status}, Logged in as: {res['user']['name']} ({res['user']['role']})")
    assert status == 200

    # User governance: fetch users
    status, users_res = request(admin_client, "GET", "/api/admin/users", use_proxy=True)
    users = users_res["users"]
    print(f"Admin reviewing {len(users)} platform users:")
    for u in users:
        print(f"  • {u['name']} ({u['email']}) - Role: {u['role']} - Status: {'Active' if u['is_active'] else 'Suspended'}")

    # Admin analytics
    status, an_res = request(admin_client, "GET", "/api/admin/analytics", use_proxy=True)
    stats = an_res["stats"]
    print(f"Admin Platform Metrics Overview:")
    print(f"  • Total Registered Users: {stats['total_users']} (Trainees: {stats['trainees']}, Trainers: {stats['trainers']}, Admins: {stats['admins']})")
    print(f"  • Total Courses: {stats['total_courses']} (Published: {stats['published_courses']})")
    print(f"  • Total Enrollments: {stats['total_enrollments']}")
    print(f"  • Completion Rate: {stats['completion_rate']}%")
    print(f"  • Total Verified Certificates Issued: {stats['total_certificates']}")

    # Public certificate verification check
    status, verify_res = request(admin_client, "GET", f"/api/certificates/verify/{cert['certificate_code']}", use_proxy=True)
    print(f"Public Certificate Verification ({cert['certificate_code']}): Valid = {verify_res['valid']}")
    assert verify_res["valid"] is True

    status, _ = request(admin_client, "POST", "/api/auth/logout", use_proxy=True)
    print("Admin logged out.")

    print("\n" + "=" * 60)
    print("COMPLETE END-TO-END HACKATHON DEMO FLOW PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_hackathon_demo_flow()
