import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_user(db):
    def _make(email="user@test.com", password="testpass123", role="analyst"):
        return User.objects.create_user(email=email, username=email, password=password, role=role)
    return _make


@pytest.fixture
def auth_client(api_client, create_user):
    user = create_user()
    resp = api_client.post("/api/v1/auth/login/", {"email": user.email, "password": "testpass123"}, format="json")
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return api_client, user


# ── Register ───────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_register_success(api_client):
    payload = {
        "email": "new@test.com",
        "username": "newuser",
        "password": "securePass1",
        "password_confirm": "securePass1",
    }
    resp = api_client.post("/api/v1/auth/register/", payload, format="json")
    assert resp.status_code == 201
    assert "access" in resp.data
    assert resp.data["user"]["email"] == "new@test.com"


@pytest.mark.django_db
def test_register_password_mismatch(api_client):
    payload = {
        "email": "mismatch@test.com",
        "username": "mismatch",
        "password": "securePass1",
        "password_confirm": "different",
    }
    resp = api_client.post("/api/v1/auth/register/", payload, format="json")
    assert resp.status_code == 400


@pytest.mark.django_db
def test_register_duplicate_email(api_client, create_user):
    create_user(email="existing@test.com")
    payload = {
        "email": "existing@test.com",
        "username": "newone",
        "password": "securePass1",
        "password_confirm": "securePass1",
    }
    resp = api_client.post("/api/v1/auth/register/", payload, format="json")
    assert resp.status_code == 400


# ── Login ──────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_login_success(api_client, create_user):
    create_user(email="login@test.com", password="mypassword")
    resp = api_client.post("/api/v1/auth/login/", {"email": "login@test.com", "password": "mypassword"}, format="json")
    assert resp.status_code == 200
    assert "access" in resp.data
    assert "refresh" in resp.data


@pytest.mark.django_db
def test_login_bad_credentials(api_client, create_user):
    create_user(email="bad@test.com", password="correctpass")
    resp = api_client.post("/api/v1/auth/login/", {"email": "bad@test.com", "password": "wrongpass"}, format="json")
    assert resp.status_code == 400


# ── Me endpoint ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_me_requires_auth(api_client):
    resp = api_client.get("/api/v1/auth/me/")
    assert resp.status_code == 401


@pytest.mark.django_db
def test_me_returns_user(auth_client):
    client, user = auth_client
    resp = client.get("/api/v1/auth/me/")
    assert resp.status_code == 200
    assert resp.data["email"] == user.email


# ── Logout ─────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_logout_blacklists_token(api_client, create_user):
    create_user(email="logout@test.com", password="pass1234")
    login_resp = api_client.post("/api/v1/auth/login/", {"email": "logout@test.com", "password": "pass1234"}, format="json")
    refresh = login_resp.data["refresh"]
    access = login_resp.data["access"]

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    resp = api_client.post("/api/v1/auth/logout/", {"refresh": refresh}, format="json")
    assert resp.status_code == 204
