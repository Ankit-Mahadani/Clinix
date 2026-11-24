from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import permissions, status
from rest_framework.views import APIView

from apps.core.responses import api_success
from apps.mappings.models import PatientDoctorMapping
from apps.mappings.serializers import PatientDoctorMappingSerializer
from apps.patients.models import Patient


class MappingListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="List all patient-doctor mappings",
        description="Returns all mappings scoped to the requesting user's patients.",
        responses={200: PatientDoctorMappingSerializer(many=True)},
    )
    def get(self, request):
        mappings = (
            PatientDoctorMapping.objects.filter(
                patient__created_by=request.user,
                patient__is_deleted=False,
            )
            .select_related("patient", "doctor")
            .order_by("-assigned_at")
        )
        serializer = PatientDoctorMappingSerializer(
            mappings, many=True, context={"request": request}
        )
        return api_success(
            data=serializer.data,
            message="Mappings retrieved successfully.",
        )

    @extend_schema(
        summary="Assign doctor to patient",
        description="Assigns a doctor to a patient owned by the user. Enforces uniqueness and primary doctor rule.",
        request=PatientDoctorMappingSerializer,
        responses={201: PatientDoctorMappingSerializer},
    )
    def post(self, request):
        serializer = PatientDoctorMappingSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        mapping = serializer.save()
        return api_success(
            data=PatientDoctorMappingSerializer(mapping, context={"request": request}).data,
            message="Doctor assigned to patient successfully.",
            status_code=status.HTTP_201_CREATED,
        )


class MappingDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get assigned doctors by patient ID or mapping ID",
        description="Returns all doctors assigned to the specified patient (or mapping details). Returns 404 if the patient does not belong to you.",
        responses={200: OpenApiResponse(description="Assigned doctors retrieved")},
    )
    def get(self, request, pk):
        # 1. Check if pk is a patient_id belonging to this user
        patient = Patient.objects.filter(pk=pk, created_by=request.user, is_deleted=False).first()

        if patient:
            mappings = (
                PatientDoctorMapping.objects.filter(patient=patient)
                .select_related("doctor")
                .order_by("-is_primary", "-assigned_at")
            )
            serializer = PatientDoctorMappingSerializer(
                mappings, many=True, context={"request": request}
            )
            return api_success(
                data={
                    "patient_id": patient.id,
                    "patient_name": patient.name,
                    "assigned_doctors": serializer.data,
                },
                message=f"Doctors assigned to {patient.name} retrieved successfully.",
            )

        # 2. Check if pk corresponds to a mapping ID owned by this user
        mapping = (
            PatientDoctorMapping.objects.filter(
                pk=pk, patient__created_by=request.user, patient__is_deleted=False
            )
            .select_related("patient", "doctor")
            .first()
        )

        if mapping:
            serializer = PatientDoctorMappingSerializer(mapping, context={"request": request})
            return api_success(
                data=serializer.data,
                message="Mapping details retrieved successfully.",
            )

        # 3. Not found or not owned -> return 404 (never leak existence)
        return get_object_or_404(Patient, pk=pk, created_by=request.user, is_deleted=False)

    @extend_schema(
        summary="Remove doctor assignment",
        description="Removes a patient-doctor mapping by mapping ID. Returns 404 if not found or unauthorized.",
        responses={200: OpenApiResponse(description="Doctor unassigned successfully")},
    )
    def delete(self, request, pk):
        # Find mapping by ID where the patient belongs to the requesting user
        mapping = get_object_or_404(
            PatientDoctorMapping,
            pk=pk,
            patient__created_by=request.user,
        )
        mapping_id = mapping.id
        patient_name = mapping.patient.name
        doctor_name = mapping.doctor.name

        mapping.delete()

        return api_success(
            data={"id": mapping_id},
            message=f"Dr. {doctor_name} unassigned from {patient_name} successfully.",
            status_code=status.HTTP_200_OK,
        )
