from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from apps.core.models import TimeStampedModel


class Doctor(TimeStampedModel):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="doctors",
        db_index=True,
    )
    name = models.CharField(max_length=255, db_index=True)
    specialization = models.CharField(max_length=100, db_index=True)
    license_number = models.CharField(max_length=100, unique=True, db_index=True)
    years_of_experience = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    hospital = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=25, blank=True)
    email = models.EmailField(blank=True)
    consultation_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00, validators=[MinValueValidator(0)]
    )
    availability = models.CharField(max_length=150, default="Mon - Fri (09:00 - 17:00)")
    is_active = models.BooleanField(default=True)

    class Meta(TimeStampedModel.Meta):
        verbose_name = "Doctor"
        verbose_name_plural = "Doctors"
        indexes = [
            models.Index(fields=["specialization", "is_active"]),
        ]

    def __str__(self):
        return f"Dr. {self.name} - {self.specialization} ({self.license_number})"
