import pytest
from rest_framework import status
from apps.accounts.models import User


@pytest.mark.django_db
class TestAuthentication:
    def test_register_success(self, api_client):
        payload = {
            "name": "Dr. Clara Watson",
            "email": "clara.watson@clinic.com",
            "password": "StrongPassword123!",
            "password2": "StrongPassword123!",
        }
        response = api_client.post("/api/auth/register/", payload, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["success"] is True
        assert "access" in data["data"]
        assert "refresh" in data["data"]
        assert data["data"]["user"]["email"] == "clara.watson@clinic.com"
        assert User.objects.filter(email="clara.watson@clinic.com").exists()

    def test_register_password_mismatch(self, api_client):
        payload = {
            "name": "Dr. Clara Watson",
            "email": "clara.watson@clinic.com",
            "password": "StrongPassword123!",
            "password2": "DifferentPassword123!",
        }
        response = api_client.post("/api/auth/register/", payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "VALIDATION_ERROR"
        assert "password2" in data["error"]["details"]

    def test_register_duplicate_email(self, api_client, user_a):
        payload = {
            "name": "Duplicate User",
            "email": user_a.email,
            "password": "StrongPassword123!",
            "password2": "StrongPassword123!",
        }
        response = api_client.post("/api/auth/register/", payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert data["success"] is False

    def test_login_success(self, api_client, user_a):
        payload = {
            "email": user_a.email,
            "password": "SecurePassword123!",
        }
        response = api_client.post("/api/auth/login/", payload, format="json")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert "access" in data["data"]
        assert "refresh" in data["data"]
        assert data["data"]["user"]["email"] == user_a.email

    def test_login_invalid_password(self, api_client, user_a):
        payload = {
            "email": user_a.email,
            "password": "WrongPassword!",
        }
        response = api_client.post("/api/auth/login/", payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert data["success"] is False

    def test_token_refresh(self, api_client, user_a):
        # 1. Login to get tokens
        login_res = api_client.post(
            "/api/auth/login/",
            {"email": user_a.email, "password": "SecurePassword123!"},
            format="json",
        )
        refresh_token = login_res.json()["data"]["refresh"]

        # 2. Refresh token
        refresh_res = api_client.post(
            "/api/auth/token/refresh/",
            {"refresh": refresh_token},
            format="json",
        )

        assert refresh_res.status_code == status.HTTP_200_OK
        data = refresh_res.json()
        assert data["success"] is True
        assert "access" in data["data"]

    def test_logout_and_blacklist(self, api_client, user_a):
        login_res = api_client.post(
            "/api/auth/login/",
            {"email": user_a.email, "password": "SecurePassword123!"},
            format="json",
        )
        access_token = login_res.json()["data"]["access"]
        refresh_token = login_res.json()["data"]["refresh"]

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        logout_res = api_client.post(
            "/api/auth/logout/",
            {"refresh": refresh_token},
            format="json",
        )
        assert logout_res.status_code == status.HTTP_200_OK

        # Attempting to use blacklisted refresh token should fail
        refresh_res = api_client.post(
            "/api/auth/token/refresh/",
            {"refresh": refresh_token},
            format="json",
        )
        assert refresh_res.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_and_update_current_user_profile(self, auth_client_a, user_a):
        # GET /api/auth/me/
        get_res = auth_client_a.get("/api/auth/me/")
        assert get_res.status_code == status.HTTP_200_OK
        assert get_res.json()["data"]["email"] == user_a.email

        # PATCH /api/auth/me/
        patch_res = auth_client_a.patch(
            "/api/auth/me/",
            {"name": "Dr. Alice M. Smith, MD"},
            format="json",
        )
        assert patch_res.status_code == status.HTTP_200_OK
        assert patch_res.json()["data"]["name"] == "Dr. Alice M. Smith, MD"

    def test_unauthenticated_request_envelope(self, api_client):
        response = api_client.get("/api/patients/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "AUTHENTICATION_FAILED"
