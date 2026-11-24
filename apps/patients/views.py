from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework import permissions, status, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.permissions import IsOwner
from apps.core.responses import api_success
from apps.patients.filters import PatientFilter
from apps.patients.models import Patient
from apps.patients.serializers import PatientDetailSerializer, PatientSerializer


class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing patient records.
    Strictly isolated per authenticated user: users can only view,
    create, update, and delete their own patient records.
    """

    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = PatientFilter
    search_fields = ["name", "email", "phone", "medical_history", "allergies"]
    ordering_fields = ["name", "age", "created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PatientDetailSerializer
        return PatientSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Patient.objects.none()

        include_deleted = self.request.query_params.get("include_deleted") == "true"
        manager = Patient.all_objects if include_deleted else Patient.objects

        # Owner isolation: never expose or leak existence of other users' patients
        return manager.filter(created_by=user).select_related("created_by")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        patient = serializer.save(created_by=request.user)
        return api_success(
            data=PatientSerializer(patient).data,
            message="Patient record created successfully.",
            status_code=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_success(
            data=serializer.data,
            message="Patient record retrieved successfully.",
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        patient = serializer.save()
        return api_success(
            data=PatientSerializer(patient).data,
            message="Patient record updated successfully.",
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        soft = request.query_params.get("soft", "false").lower() == "true"

        if soft:
            instance.delete(soft=True)
            msg = "Patient record soft-deleted successfully (retained in audit log)."
        else:
            instance.delete(soft=False)
            msg = "Patient record permanently deleted."

        return api_success(
            data={"id": instance.id, "soft_deleted": soft},
            message=msg,
            status_code=status.HTTP_200_OK,
        )
