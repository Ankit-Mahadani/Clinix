from django.db import connection
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Service Health Check",
        description="Verifies API and database connectivity.",
        responses={200: OpenApiResponse(description="System is operational")},
    )
    def get(self, request):
        db_healthy = True
        error_detail = None
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception as exc:
            db_healthy = False
            error_detail = str(exc)

        data = {
            "status": "healthy" if db_healthy else "unhealthy",
            "database": "connected" if db_healthy else "disconnected",
            "timestamp": timezone.now().isoformat(),
            "version": "1.0.0",
        }
        if error_detail:
            data["error"] = error_detail

        http_status = status.HTTP_200_OK if db_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response({"success": db_healthy, "data": data}, status=http_status)
