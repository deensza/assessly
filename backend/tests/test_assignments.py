import uuid


def _email():
    return f"u_{uuid.uuid4().hex[:8]}@test.com"


def _register_login(client, role="student"):
    email = _email()
    res = client.post("/api/auth/register", json={
        "name": "Test User", "email": email, "password": "pass1234", "role": role,
    })
    body = res.get_json()
    return body["token"], body["user"]


def _headers(token):
    return {"Authorization": f"Bearer {token}"}


def _create_course(client, token):
    res = client.post("/api/courses", json={"title": f"Course {uuid.uuid4().hex[:4]}"}, headers=_headers(token))
    return res.get_json()["course"]["id"]


def _create_assignment(client, token, course_id, title="Assignment", test_cases=None):
    return client.post("/api/assignments", json={
        "course_id": course_id,
        "title": title,
        "description": "Test description",
        "test_cases": test_cases or [],
    }, headers=_headers(token))


# --- create assignment ---

def test_instructor_can_create_assignment(client):
    token, _ = _register_login(client, role="instructor")
    course_id = _create_course(client, token)
    res = _create_assignment(client, token, course_id, title="Hello World",
                             test_cases=[{"input": "", "expected_output": "Hello", "is_hidden": False, "weight": 1.0}])
    assert res.status_code == 201
    body = res.get_json()
    assert body["assignment"]["title"] == "Hello World"
    assert len(body["assignment"]["test_cases"]) == 1


def test_student_cannot_create_assignment(client):
    token, _ = _register_login(client, role="student")
    res = _create_assignment(client, token, course_id=1)
    assert res.status_code == 403


def test_create_assignment_without_auth_returns_401(client):
    res = client.post("/api/assignments", json={"course_id": 1, "title": "No Auth"})
    assert res.status_code == 401


def test_create_assignment_missing_title_returns_400(client):
    token, _ = _register_login(client, role="instructor")
    course_id = _create_course(client, token)
    res = client.post("/api/assignments", json={"course_id": course_id}, headers=_headers(token))
    assert res.status_code == 400


# --- get assignment ---

def test_get_assignment_returns_details(client):
    token, _ = _register_login(client, role="instructor")
    course_id = _create_course(client, token)
    create_res = _create_assignment(client, token, course_id, title="Get Me")
    assignment_id = create_res.get_json()["assignment"]["id"]

    res = client.get(f"/api/assignments/{assignment_id}", headers=_headers(token))
    assert res.status_code == 200
    assert res.get_json()["assignment"]["id"] == assignment_id


def test_get_nonexistent_assignment_returns_404(client):
    token, _ = _register_login(client, role="instructor")
    res = client.get("/api/assignments/99999", headers=_headers(token))
    assert res.status_code == 404


def test_get_assignment_without_auth_returns_401(client):
    res = client.get("/api/assignments/1")
    assert res.status_code == 401


# --- list assignments ---

def test_instructor_can_list_course_assignments(client):
    token, _ = _register_login(client, role="instructor")
    course_id = _create_course(client, token)
    _create_assignment(client, token, course_id, title="A1")
    _create_assignment(client, token, course_id, title="A2")

    res = client.get(f"/api/assignments/course/{course_id}", headers=_headers(token))
    assert res.status_code == 200
    assignments = res.get_json()["assignments"]
    assert len(assignments) >= 2


def test_student_cannot_list_assignments_without_enrollment(client):
    instructor_token, _ = _register_login(client, role="instructor")
    course_id = _create_course(client, instructor_token)

    student_token, _ = _register_login(client, role="student")
    res = client.get(f"/api/assignments/course/{course_id}", headers=_headers(student_token))
    assert res.status_code == 403


def test_list_assignments_nonexistent_course_returns_404(client):
    token, _ = _register_login(client, role="instructor")
    res = client.get("/api/assignments/course/99999", headers=_headers(token))
    assert res.status_code == 404
