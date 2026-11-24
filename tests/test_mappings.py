import pytest
from rest_framework import status
from apps.mappings.models import PatientDoctorMapping


@pytest.mark.django_db
class TestMappings:
    def test_assign_doctor_success(
        self, auth_client_a, sample_patient_a, sample_doctor_a
    ):
        payload = {
            "patient": sample_patient_a.id,
            "doctor": sample_doctor_a.id,
            "is_primary": True,
            "notes": "Primary nephrologist intake.",
        }
        response = auth_client_a.post("/api/mappings/", payload, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["success"] is True
        assert data["data"]["patient_name"] == sample_patient_a.name
        assert data["data"]["doctor_name"] == sample_doctor_a.name
        assert data["data"]["is_primary"] is True
        assert PatientDoctorMapping.objects.filter(
            patient=sample_patient_a, doctor=sample_doctor_a
        ).exists()

    def test_assign_doctor_to_another_users_patient_forbidden(
        self, auth_client_a, sample_patient_b, sample_doctor_a
    ):
        # Client A attempts to assign doctor to Client B's patient
        payload = {
            "patient": sample_patient_b.id,
            "doctor": sample_doctor_a.id,
        }
        response = auth_client_a.post("/api/mappings/", payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert data["success"] is False
        assert "patient" in data["error"]["details"]

    def test_duplicate_mapping_clean_400(
        self, auth_client_a, sample_patient_a, sample_doctor_a
    ):
        # First assignment succeeds
        PatientDoctorMapping.objects.create(
            patient=sample_patient_a, doctor=sample_doctor_a
        )

        # Duplicate assignment attempt
        payload = {
            "patient": sample_patient_a.id,
            "doctor": sample_doctor_a.id,
        }
        response = auth_client_a.post("/api/mappings/", payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert data["success"] is False
        assert (
            data["error"]["code"] == "DUPLICATE_ENTRY"
            or "duplicate" in data["error"]["message"].lower()
            or "already assigned" in data["error"]["message"].lower()
        )

    def test_primary_doctor_rule_enforcement(
        self, auth_client_a, sample_patient_a, sample_doctor_a, sample_doctor_b
    ):
        # 1. Assign Doctor A as primary
        auth_client_a.post(
            "/api/mappings/",
            {"patient": sample_patient_a.id, "doctor": sample_doctor_a.id, "is_primary": True},
            format="json",
        )
        mapping_a = PatientDoctorMapping.objects.get(
            patient=sample_patient_a, doctor=sample_doctor_a
        )
        assert mapping_a.is_primary is True

        # 2. Assign Doctor B as primary for the SAME patient
        auth_client_a.post(
            "/api/mappings/",
            {"patient": sample_patient_a.id, "doctor": sample_doctor_b.id, "is_primary": True},
            format="json",
        )

        # Doctor B is now primary; Doctor A has been demoted to non-primary
        mapping_b = PatientDoctorMapping.objects.get(
            patient=sample_patient_a, doctor=sample_doctor_b
        )
        mapping_a.refresh_from_db()

        assert mapping_b.is_primary is True
        assert mapping_a.is_primary is False

    def test_list_mappings_scoped_to_user_patients(
        self, auth_client_a, auth_client_b, sample_patient_a, sample_patient_b, sample_doctor_a
    ):
        m_a = PatientDoctorMapping.objects.create(
            patient=sample_patient_a, doctor=sample_doctor_a
        )
        m_b = PatientDoctorMapping.objects.create(
            patient=sample_patient_b, doctor=sample_doctor_a
        )

        # Client A should only see m_a
        res_a = auth_client_a.get("/api/mappings/")
        assert res_a.status_code == status.HTTP_200_OK
        ids_a = [m["id"] for m in res_a.json()["data"]]
        assert m_a.id in ids_a
        assert m_b.id not in ids_a

    def test_get_mappings_by_patient_id(
        self, auth_client_a, auth_client_b, sample_patient_a, sample_doctor_a
    ):
        PatientDoctorMapping.objects.create(
            patient=sample_patient_a, doctor=sample_doctor_a
        )

        # Client A requests assigned doctors for their patient
        res = auth_client_a.get(f"/api/mappings/{sample_patient_a.id}/")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()["data"]
        assert data["patient_name"] == sample_patient_a.name
        assert len(data["assigned_doctors"]) == 1

        # Client B requests assigned doctors for Client A's patient -> 404
        res_unauthorized = auth_client_b.get(f"/api/mappings/{sample_patient_a.id}/")
        assert res_unauthorized.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_mapping(
        self, auth_client_a, auth_client_b, sample_patient_a, sample_doctor_a
    ):
        mapping = PatientDoctorMapping.objects.create(
            patient=sample_patient_a, doctor=sample_doctor_a
        )

        # Non-owner of patient cannot delete mapping
        res_unauthorized = auth_client_b.delete(f"/api/mappings/{mapping.id}/")
        assert res_unauthorized.status_code == status.HTTP_404_NOT_FOUND
        assert PatientDoctorMapping.objects.filter(id=mapping.id).exists()

        # Owner can delete mapping
        res = auth_client_a.delete(f"/api/mappings/{mapping.id}/")
        assert res.status_code == status.HTTP_200_OK
        assert not PatientDoctorMapping.objects.filter(id=mapping.id).exists()
