import pytest
from rest_framework import status

from apps.doctors.models import Doctor


@pytest.mark.django_db
class TestDoctors:
    def test_create_doctor(self, auth_client_a, user_a):
        payload = {
            "name": "Stephen Strange",
            "specialization": "Neurosurgery",
            "license_number": "MED-NY-99120",
            "years_of_experience": 15,
            "hospital": "Metro General Hospital",
            "consultation_fee": 300.00,
        }
        response = auth_client_a.post("/api/doctors/", payload, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["success"] is True
        assert data["data"]["name"] == "Stephen Strange"
        assert data["data"]["is_creator"] is True

        doctor = Doctor.objects.get(id=data["data"]["id"])
        assert doctor.created_by == user_a

    def test_list_doctors_accessible_to_all_authenticated(
        self, auth_client_a, auth_client_b, sample_doctor_a, sample_doctor_b
    ):
        # Both client A and B can view all doctors
        res_a = auth_client_a.get("/api/doctors/")
        res_b = auth_client_b.get("/api/doctors/")

        assert res_a.status_code == status.HTTP_200_OK
        assert res_b.status_code == status.HTTP_200_OK

        ids_a = [d["id"] for d in res_a.json()["data"]["results"]]
        assert sample_doctor_a.id in ids_a
        assert sample_doctor_b.id in ids_a

    def test_update_doctor_permissions(self, auth_client_a, auth_client_b, sample_doctor_a):
        # Creator (Client A) can update
        res_owner = auth_client_a.patch(
            f"/api/doctors/{sample_doctor_a.id}/",
            {"consultation_fee": 275.00},
            format="json",
        )
        assert res_owner.status_code == status.HTTP_200_OK
        assert float(res_owner.json()["data"]["consultation_fee"]) == 275.00

        # Non-creator (Client B) receives 403 Forbidden
        res_non_owner = auth_client_b.patch(
            f"/api/doctors/{sample_doctor_a.id}/",
            {"consultation_fee": 300.00},
            format="json",
        )
        assert res_non_owner.status_code == status.HTTP_403_FORBIDDEN
        assert res_non_owner.json()["error"]["code"] == "PERMISSION_DENIED"

    def test_delete_doctor_permissions(self, auth_client_a, auth_client_b, sample_doctor_a):
        # Non-creator receives 403
        res_non_owner = auth_client_b.delete(f"/api/doctors/{sample_doctor_a.id}/")
        assert res_non_owner.status_code == status.HTTP_403_FORBIDDEN
        assert Doctor.objects.filter(id=sample_doctor_a.id).exists()

        # Creator can delete
        res_owner = auth_client_a.delete(f"/api/doctors/{sample_doctor_a.id}/")
        assert res_owner.status_code == status.HTTP_200_OK
        assert not Doctor.objects.filter(id=sample_doctor_a.id).exists()

    def test_duplicate_license_number_validation(self, auth_client_a, sample_doctor_a):
        payload = {
            "name": "Imposter Doctor",
            "specialization": "General",
            "license_number": sample_doctor_a.license_number,
        }
        response = auth_client_a.post("/api/doctors/", payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert data["success"] is False
        assert "license_number" in data["error"]["details"]
