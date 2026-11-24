import pytest
from rest_framework import status
from apps.patients.models import Patient


@pytest.mark.django_db
class TestPatients:
    def test_create_patient_auto_attaches_owner(self, auth_client_a, user_a):
        payload = {
            "name": "Marcus Aurelius",
            "age": 58,
            "gender": "M",
            "blood_group": "A+",
            "phone": "+15551112233",
            "email": "marcus@rome.org",
            "medical_history": "Hypertension",
        }
        response = auth_client_a.post("/api/patients/", payload, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["success"] is True
        assert data["data"]["name"] == "Marcus Aurelius"
        assert data["data"]["created_by_email"] == user_a.email

        patient = Patient.objects.get(id=data["data"]["id"])
        assert patient.created_by == user_a

    def test_list_patients_owner_isolation(
        self, auth_client_a, auth_client_b, sample_patient_a, sample_patient_b
    ):
        # Client A should ONLY see patient A
        res_a = auth_client_a.get("/api/patients/")
        assert res_a.status_code == status.HTTP_200_OK
        data_a = res_a.json()["data"]["results"]
        ids_a = [p["id"] for p in data_a]
        assert sample_patient_a.id in ids_a
        assert sample_patient_b.id not in ids_a

        # Client B should ONLY see patient B
        res_b = auth_client_b.get("/api/patients/")
        assert res_b.status_code == status.HTTP_200_OK
        data_b = res_b.json()["data"]["results"]
        ids_b = [p["id"] for p in data_b]
        assert sample_patient_b.id in ids_b
        assert sample_patient_a.id not in ids_b

    def test_retrieve_patient_owner_isolation(
        self, auth_client_a, auth_client_b, sample_patient_a, sample_patient_b
    ):
        # Owner can retrieve
        res = auth_client_a.get(f"/api/patients/{sample_patient_a.id}/")
        assert res.status_code == status.HTTP_200_OK
        assert res.json()["data"]["name"] == sample_patient_a.name

        # Non-owner receives 404 (strictly concealing existence)
        res_unauthorized = auth_client_b.get(f"/api/patients/{sample_patient_a.id}/")
        assert res_unauthorized.status_code == status.HTTP_404_NOT_FOUND
        assert res_unauthorized.json()["success"] is False

    def test_update_patient_owner_isolation(
        self, auth_client_a, auth_client_b, sample_patient_a
    ):
        # Owner can update
        res = auth_client_a.patch(
            f"/api/patients/{sample_patient_a.id}/",
            {"age": 46},
            format="json",
        )
        assert res.status_code == status.HTTP_200_OK
        assert res.json()["data"]["age"] == 46

        # Non-owner receives 404
        res_unauthorized = auth_client_b.patch(
            f"/api/patients/{sample_patient_a.id}/",
            {"age": 47},
            format="json",
        )
        assert res_unauthorized.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_patient_owner_isolation(
        self, auth_client_a, auth_client_b, sample_patient_a
    ):
        # Non-owner cannot delete
        res_unauthorized = auth_client_b.delete(
            f"/api/patients/{sample_patient_a.id}/"
        )
        assert res_unauthorized.status_code == status.HTTP_404_NOT_FOUND
        assert Patient.objects.filter(id=sample_patient_a.id).exists()

        # Owner can delete
        res = auth_client_a.delete(f"/api/patients/{sample_patient_a.id}/")
        assert res.status_code == status.HTTP_200_OK
        assert not Patient.objects.filter(id=sample_patient_a.id).exists()

    def test_soft_delete_option(self, auth_client_a, sample_patient_a):
        res = auth_client_a.delete(
            f"/api/patients/{sample_patient_a.id}/?soft=true"
        )
        assert res.status_code == status.HTTP_200_OK
        assert res.json()["data"]["soft_deleted"] is True

        # Normal queries exclude it
        assert not Patient.objects.filter(id=sample_patient_a.id).exists()
        # Retained in database with is_deleted=True
        assert Patient.all_objects.filter(id=sample_patient_a.id, is_deleted=True).exists()

    def test_validation_errors(self, auth_client_a):
        # Negative age
        res1 = auth_client_a.post(
            "/api/patients/",
            {"name": "Valid Name", "age": -5, "gender": "M"},
            format="json",
        )
        assert res1.status_code == status.HTTP_400_BAD_REQUEST

        # Age > 150
        res2 = auth_client_a.post(
            "/api/patients/",
            {"name": "Valid Name", "age": 160, "gender": "M"},
            format="json",
        )
        assert res2.status_code == status.HTTP_400_BAD_REQUEST

        # Empty name
        res3 = auth_client_a.post(
            "/api/patients/",
            {"name": "   ", "age": 30, "gender": "M"},
            format="json",
        )
        assert res3.status_code == status.HTTP_400_BAD_REQUEST

    def test_search_and_filter(self, auth_client_a, user_a):
        Patient.objects.create(name="Leonard McCoy", age=50, gender="M", blood_group="O+", created_by=user_a)
        Patient.objects.create(name="Beverly Crusher", age=45, gender="F", blood_group="A+", created_by=user_a)

        # Search by name
        res_search = auth_client_a.get("/api/patients/?search=Beverly")
        assert res_search.status_code == status.HTTP_200_OK
        results = res_search.json()["data"]["results"]
        assert len(results) == 1
        assert results[0]["name"] == "Beverly Crusher"

        # Filter by gender
        res_gender = auth_client_a.get("/api/patients/?gender=F")
        assert res_gender.status_code == status.HTTP_200_OK
        assert all(p["gender"] == "F" for p in res_gender.json()["data"]["results"])
