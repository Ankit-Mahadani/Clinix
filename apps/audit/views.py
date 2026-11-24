from drf_spectacular.utils import extend_schema
from rest_framework import permissions
from rest_framework.generics import ListAPIView

from apps.audit.models import AuditLog
from apps.audit.serializers import AuditLogSerializer
from apps.core.pagination import StandardResultsSetPagination


class AuditLogListView(ListAPIView):
    """
    Read-only view for retrieving system activity and audit history
    associated with the requesting user.
    """

    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    @extend_schema(
        summary="List user audit logs",
        description="Returns audit trail events (create, update, delete, login, logout) for the current user.",
    )
    def get_queryset(self):
        user = self.request.user
        return (
            AuditLog.objects.filter(user=user)
            .select_related("user")
            .order_by("-timestamp")
        )
