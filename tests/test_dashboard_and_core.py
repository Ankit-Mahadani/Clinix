import pytest
from rest_framework import status
from apps.audit.models import AuditLog
from apps.doctors.models import Doctor
from apps.mappings.models import PatientDoctorMapping
from apps.patients.models import Patient


@pytest.mark.django_db
class TestDashboardAndCore:
    def test_dashboard_stats(
        self, auth_client_a, user_a, sample_patient_a, sample_doctor_a
    ):
        # Create unassigned patient
        Patient.objects.create(name="Unassigned Patient", age=40, gender="F", created_by=user_a)

        # Assign sample_doctor_a to sample_patient_a
        PatientDoctorMapping.objects.create(
            patient=sample_patient_a, doctor=sample_doctor_a, is_primary=True
        )

        res = auth_client_a.get("/api/dashboard/stats/")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()["data"]

        assert data["kpis"]["total_patients"] == 2
        assert data["kpis"]["active_mappings"] == 1
        assert data["kpis"]["unassigned_patients"] == 1
        assert "top_specializations" in data
        assert "monthly_trend" in data

    def test_audit_log_generation(self, auth_client_a, user_a):
        # Creating a patient should generate an audit log via signal
        auth_client_a.post(
            "/api/patients/",
            {"name": "Audited Patient", "age": 28, "gender": "F"},
            format="json",
        )

        audit_entry = AuditLog.objects.filter(
            user=user_a, resource_type="Patient", action="CREATE"
        ).first()
        assert audit_entry is not None
        assert audit_entry.details.get("name") == "Audited Patient"

        # Audit log list endpoint
        res = auth_client_a.get("/api/audit/")
        assert res.status_code == status.HTTP_200_OK
        assert len(res.json()["data"]["results"]) > 0

    def test_health_check_endpoint(self, api_client):
        res = api_client.get("/api/health/")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()
        assert data["success"] is True
        assert data["data"]["status"] == "healthy"
        assert data["data"]["database"] == "connected"
