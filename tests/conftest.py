import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.doctors.models import Doctor
from apps.mappings.models import PatientDoctorMapping
from apps.patients.models import Patient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user_a(db):
    return User.objects.create_user(
        email="doctor.a@hospital.org",
        name="Dr. Alice Smith",
        password="SecurePassword123!",
    )


@pytest.fixture
def user_b(db):
    return User.objects.create_user(
        email="doctor.b@hospital.org",
        name="Dr. Bob Jones",
        password="SecurePassword123!",
    )


@pytest.fixture
def auth_client_a(user_a):
    client = APIClient()
    client.force_authenticate(user=user_a)
    return client


@pytest.fixture
def auth_client_b(user_b):
    client = APIClient()
    client.force_authenticate(user=user_b)
    return client


@pytest.fixture
def sample_patient_a(user_a):
    return Patient.objects.create(
        name="John Doe",
        age=45,
        gender="M",
        blood_group="O+",
        phone="+15551234567",
        email="john.doe@example.com",
        created_by=user_a,
    )


@pytest.fixture
def sample_patient_b(user_b):
    return Patient.objects.create(
        name="Jane Roe",
        age=32,
        gender="F",
        blood_group="A+",
        phone="+15559876543",
        email="jane.roe@example.com",
        created_by=user_b,
    )


@pytest.fixture
def sample_doctor_a(user_a):
    return Doctor.objects.create(
        name="Gregory House",
        specialization="Nephrology",
        license_number="LIC-MED-0001",
        years_of_experience=20,
        hospital="Princeton-Plainsboro",
        consultation_fee=250.00,
        created_by=user_a,
    )


@pytest.fixture
def sample_doctor_b(user_b):
    return Doctor.objects.create(
        name="James Wilson",
        specialization="Oncology",
        license_number="LIC-MED-0002",
        years_of_experience=18,
        hospital="Princeton-Plainsboro",
        consultation_fee=220.00,
        created_by=user_b,
    )
