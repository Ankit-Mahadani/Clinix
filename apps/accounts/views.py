from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import permissions, serializers, status
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView

from apps.accounts.serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserProfileUpdateSerializer,
    UserSerializer,
)
from apps.accounts.throttles import AuthRateThrottle
from apps.audit.signals import record_audit
from apps.core.responses import api_success


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    @extend_schema(
        summary="Register new user",
        description="Creates a new user account with email as the unique identifier and returns user info with JWT tokens.",
        request=RegisterSerializer,
        responses={201: OpenApiResponse(description="User registered successfully")},
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        record_audit(
            user=user,
            action="CREATE",
            resource_type="User",
            resource_id=user.id,
            details={"email": user.email, "name": user.name},
        )

        access_str = str(refresh.access_token)
        refresh_str = str(refresh)

        return api_success(
            data={
                "user": user_data,
                "access": access_str,
                "refresh": refresh_str,
                "tokens": {
                    "access": access_str,
                    "refresh": refresh_str,
                },
            },
            message="User registration successful.",
            status_code=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    @extend_schema(
        summary="User Login",
        description="Authenticates with email and password, returning user data and JWT tokens.",
        request=LoginSerializer,
        responses={200: OpenApiResponse(description="Authentication successful")},
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        record_audit(
            user=user,
            action="LOGIN",
            resource_type="Auth",
            resource_id=user.id,
            details={"email": user.email},
        )

        access_str = str(refresh.access_token)
        refresh_str = str(refresh)

        return api_success(
            data={
                "user": user_data,
                "access": access_str,
                "refresh": refresh_str,
                "tokens": {
                    "access": access_str,
                    "refresh": refresh_str,
                },
            },
            message="Authentication successful.",
            status_code=status.HTTP_200_OK,
        )


class TokenRefreshView(BaseTokenRefreshView):
    """
    Standard SimpleJWT refresh view wrapped with MediTrack's response envelope.
    """

    @extend_schema(
        summary="Refresh JWT Access Token",
        description="Takes a valid refresh token and yields a fresh access token (and rotates refresh if enabled).",
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0]) from e

        return api_success(
            data=serializer.validated_data,
            message="Token refreshed successfully.",
            status_code=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Logout & Blacklist Refresh Token",
        description="Invalidates and blacklists the provided refresh token, effectively terminating the session.",
        request=inline_serializer(
            "LogoutRequest", fields={"refresh": serializers.CharField(required=False)}
        ),
        responses={200: OpenApiResponse(description="Logged out successfully")},
    )
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return api_success(
                data={},
                message="Refresh token not supplied, session ended locally.",
                status_code=status.HTTP_200_OK,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            # Token might already be expired or blacklisted; continue safely
            pass

        record_audit(
            user=request.user,
            action="LOGOUT",
            resource_type="Auth",
            resource_id=request.user.id,
        )

        return api_success(
            data={},
            message="Logout successful. Refresh token blacklisted.",
            status_code=status.HTTP_200_OK,
        )


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Retrieve Current User Profile",
        responses={200: UserSerializer},
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return api_success(data=serializer.data, message="Profile retrieved successfully.")

    @extend_schema(
        summary="Update Current User Profile",
        request=UserProfileUpdateSerializer,
        responses={200: UserSerializer},
    )
    def patch(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        updated_user = UserSerializer(request.user).data
        return api_success(data=updated_user, message="Profile updated successfully.")
