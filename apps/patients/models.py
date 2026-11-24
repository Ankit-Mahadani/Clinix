from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from apps.core.models import SoftDeleteModel, TimeStampedModel


class Patient(TimeStampedModel, SoftDeleteModel):
    GENDER_CHOICES = [
        ("M", "Male"),
        ("F", "Female"),
        ("O", "Other"),
    ]

    BLOOD_GROUP_CHOICES = [
        ("A+", "A+"),
        ("A-", "A-"),
        ("B+", "B+"),
        ("B-", "B-"),
        ("AB+", "AB+"),
        ("AB-", "AB-"),
        ("O+", "O+"),
        ("O-", "O-"),
    ]

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patients",
        db_index=True,
    )
    name = models.CharField(max_length=255, db_index=True)
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(150)]
    )
    gender = models.CharField(max_length=5, choices=GENDER_CHOICES)
    dob = models.DateField(null=True, blank=True, verbose_name="Date of Birth")
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, blank=True)
    phone = models.CharField(max_length=25, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    medical_history = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta(TimeStampedModel.Meta):
        verbose_name = "Patient"
        verbose_name_plural = "Patients"
        indexes = [
            models.Index(fields=["created_by", "is_deleted", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.name} (Age: {self.age}, {self.get_gender_display()})"
