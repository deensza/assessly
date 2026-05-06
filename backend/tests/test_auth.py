import uuid


def _email():
    return f"u_{uuid.uuid4().hex[:8]}@test.com"


def _register(client, role="student", email=None, password="pass1234"):
    return client.post("/api/auth/register", json={
        "name": "Test User",
        "email": email or _email(),
        "password": password,
        "role": role,
    })


# --- register ---

def test_register_returns_token(client):
    res = _register(client)
    assert res.status_code == 201
    body = res.get_json()
    assert "token" in body
    assert body["user"]["role"] == "student"


def test_register_missing_field_returns_400(client):
    res = client.post("/api/auth/register", json={"name": "X", "email": _email()})
    assert res.status_code == 400


def test_register_invalid_role_returns_400(client):
    res = client.post("/api/auth/register", json={
        "name": "X", "email": _email(), "password": "pass", "role": "superuser"
    })
    assert res.status_code == 400


def test_register_duplicate_email_returns_409(client):
    email = _email()
    _register(client, email=email)
    res = _register(client, email=email)
    assert res.status_code == 409


# --- login ---

def test_login_returns_token(client):
    email = _email()
    _register(client, email=email, password="secret99")
    res = client.post("/api/auth/login", json={"email": email, "password": "secret99"})
    assert res.status_code == 200
    assert "token" in res.get_json()


def test_login_wrong_password_returns_401(client):
    email = _email()
    _register(client, email=email, password="correct")
    res = client.post("/api/auth/login", json={"email": email, "password": "wrong"})
    assert res.status_code == 401


def test_login_unknown_email_returns_401(client):
    res = client.post("/api/auth/login", json={"email": "nobody@x.com", "password": "pass"})
    assert res.status_code == 401


def test_login_missing_fields_returns_400(client):
    res = client.post("/api/auth/login", json={"email": _email()})
    assert res.status_code == 400


# --- /me ---

def test_me_without_token_returns_401(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_me_with_token_returns_user(client):
    email = _email()
    reg = _register(client, email=email)
    token = reg.get_json()["token"]
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.get_json()["user"]["email"] == email


def test_me_with_invalid_token_returns_401(client):
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken"})
    assert res.status_code == 401
