from datetime import timedelta
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import permissions
from rest_framework.views import APIView

from apps.core.responses import api_success
from apps.doctors.models import Doctor
from apps.mappings.models import PatientDoctorMapping
from apps.patients.models import Patient


class DashboardStatsView(APIView):
    """
    Dashboard analytics & KPI aggregation endpoint.
    Aggregates patient, doctor, and mapping data using optimized ORM queries.
    """

    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Dashboard Metrics & Statistics",
        description="Returns KPIs (total patients, doctors, active mappings, unassigned patients), top specializations, and 6-month patient intake timeline.",
        responses={200: OpenApiResponse(description="Metrics aggregated successfully")},
    )
    def get(self, request):
        user = request.user

        # 1. High-level KPIs
        user_patients_qs = Patient.objects.filter(created_by=user)
        total_patients = user_patients_qs.count()

        total_doctors = Doctor.objects.filter(is_active=True).count()

        total_mappings = PatientDoctorMapping.objects.filter(
            patient__created_by=user,
            patient__is_deleted=False,
            status="active",
        ).count()

        # Patients with no doctor assigned
        unassigned_patients_count = (
            user_patients_qs.annotate(doc_count=Count("mappings"))
            .filter(doc_count=0)
            .count()
        )

        # 2. Top Doctor Specializations (Catalog distribution)
        top_specializations = list(
            Doctor.objects.filter(is_active=True)
            .values("specialization")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )

        # 3. Monthly Patient Intake (Last 6 Months)
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_raw = (
            user_patients_qs.filter(created_at__gte=six_months_ago)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        monthly_trend = [
            {
                "month": item["month"].strftime("%b %Y") if item["month"] else "Unknown",
                "count": item["count"],
            }
            for item in monthly_raw
        ]

        # 4. Gender breakdown for user's patients
        gender_breakdown = list(
            user_patients_qs.values("gender")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        data = {
            "kpis": {
                "total_patients": total_patients,
                "total_doctors": total_doctors,
                "active_mappings": total_mappings,
                "unassigned_patients": unassigned_patients_count,
            },
            "top_specializations": top_specializations,
            "monthly_trend": monthly_trend,
            "gender_breakdown": gender_breakdown,
        }

        return api_success(data=data, message="Dashboard statistics aggregated successfully.")
