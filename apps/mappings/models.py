from django.db import models, transaction
from django.utils import timezone
from apps.core.models import TimeStampedModel


class PatientDoctorMapping(TimeStampedModel):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="mappings",
        db_index=True,
    )
    doctor = models.ForeignKey(
        "doctors.Doctor",
        on_delete=models.CASCADE,
        related_name="mappings",
        db_index=True,
    )
    is_primary = models.BooleanField(
        default=False,
        help_text="Designates if this doctor is the primary physician for the patient.",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    notes = models.TextField(blank=True)
    assigned_at = models.DateTimeField(default=timezone.now)

    class Meta(TimeStampedModel.Meta):
        verbose_name = "Patient-Doctor Mapping"
        verbose_name_plural = "Patient-Doctor Mappings"
        unique_together = ("patient", "doctor")
        indexes = [
            models.Index(fields=["patient", "is_primary"]),
            models.Index(fields=["doctor", "status"]),
        ]

    def save(self, *args, **kwargs):
        # Enforce single primary doctor per patient:
        # If this mapping is set as primary, demote any other existing primary doctor for this patient.
        with transaction.atomic():
            if self.is_primary:
                PatientDoctorMapping.objects.filter(
                    patient=self.patient, is_primary=True
                ).exclude(pk=self.pk).update(is_primary=False)
            super().save(*args, **kwargs)

    def __str__(self):
        primary_badge = " [Primary]" if self.is_primary else ""
        return f"{self.patient.name} -> Dr. {self.doctor.name}{primary_badge} ({self.status})"
