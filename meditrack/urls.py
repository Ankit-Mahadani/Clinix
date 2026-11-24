from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from apps.core.views import HealthCheckView

urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),
    # System Health
    path("api/health/", HealthCheckView.as_view(), name="health_check"),
    # OpenAPI Schema & Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # REST API Modules
    path("api/auth/", include("apps.accounts.urls", namespace="auth")),
    path("api/patients/", include("apps.patients.urls", namespace="patients")),
    path("api/doctors/", include("apps.doctors.urls", namespace="doctors")),
    path("api/mappings/", include("apps.mappings.urls", namespace="mappings")),
    path("api/audit/", include("apps.audit.urls", namespace="audit")),
    path("api/dashboard/", include("apps.dashboard.urls", namespace="dashboard")),
    # Frontend Single Brand Dashboard
    path("", include("apps.frontend.urls", namespace="frontend")),
]
