from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status, viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.permissions import IsOwnerOrReadOnly
from apps.core.responses import api_success
from apps.doctors.filters import DoctorFilter
from apps.doctors.models import Doctor
from apps.doctors.serializers import DoctorSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    """
    Catalog of all medical doctors.
    - All authenticated users can view/search/filter all doctors.
    - Only the user who registered a doctor can update or delete their record.
    """

    queryset = Doctor.objects.select_related("created_by").all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = DoctorFilter
    search_fields = ["name", "specialization", "hospital", "license_number"]
    ordering_fields = [
        "name",
        "years_of_experience",
        "consultation_fee",
        "created_at",
    ]
    ordering = ["-created_at"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        doctor = serializer.save(created_by=request.user)
        return api_success(
            data=DoctorSerializer(doctor, context={"request": request}).data,
            message="Doctor registered successfully.",
            status_code=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={"request": request})
        return api_success(
            data=serializer.data,
            message="Doctor details retrieved successfully.",
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        doctor = serializer.save()
        return api_success(
            data=DoctorSerializer(doctor, context={"request": request}).data,
            message="Doctor record updated successfully.",
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        doc_id = instance.id
        instance.delete()
        return api_success(
            data={"id": doc_id},
            message="Doctor record removed successfully.",
            status_code=status.HTTP_200_OK,
        )
