"""
Shared pytest fixtures available to all test modules.
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email="admin@test.com", username="admin", password="adminpass123", role="admin", is_staff=True
    )


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(
        email="manager@test.com", username="manager", password="managerpass123", role="manager"
    )


@pytest.fixture
def analyst_user(db):
    return User.objects.create_user(
        email="analyst@test.com", username="analyst", password="analystpass123", role="analyst"
    )


def _get_auth_client(api_client, email, password):
    resp = api_client.post(
        "/api/v1/auth/login/", {"email": email, "password": password}, format="json"
    )
    assert resp.status_code == 200, f"Login failed: {resp.data}"
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    return _get_auth_client(api_client, "admin@test.com", "adminpass123")


@pytest.fixture
def manager_client(api_client, manager_user):
    return _get_auth_client(api_client, "manager@test.com", "managerpass123")


@pytest.fixture
def analyst_client(api_client, analyst_user):
    return _get_auth_client(api_client, "analyst@test.com", "analystpass123")
