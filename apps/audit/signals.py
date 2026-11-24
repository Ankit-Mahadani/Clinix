import logging

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.audit.models import AuditLog
from apps.doctors.models import Doctor
from apps.mappings.models import PatientDoctorMapping
from apps.patients.models import Patient

logger = logging.getLogger("meditrack.audit")


def record_audit(user, action, resource_type, resource_id, details=None, ip_address=None):
    try:
        AuditLog.objects.create(
            user=user,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id),
            details=details or {},
            ip_address=ip_address,
        )
    except Exception as exc:
        logger.warning(f"Failed to write audit log: {exc}")


@receiver(post_save, sender=Patient)
def audit_patient_save(sender, instance, created, **kwargs):
    action = "CREATE" if created else "UPDATE"
    details = {
        "name": instance.name,
        "age": instance.age,
        "gender": instance.gender,
        "is_deleted": instance.is_deleted,
    }
    record_audit(
        user=instance.created_by,
        action=action,
        resource_type="Patient",
        resource_id=instance.id,
        details=details,
    )


@receiver(post_delete, sender=Patient)
def audit_patient_delete(sender, instance, **kwargs):
    record_audit(
        user=instance.created_by,
        action="DELETE",
        resource_type="Patient",
        resource_id=instance.id,
        details={"name": instance.name, "mode": "hard_delete"},
    )


@receiver(post_save, sender=Doctor)
def audit_doctor_save(sender, instance, created, **kwargs):
    action = "CREATE" if created else "UPDATE"
    details = {
        "name": instance.name,
        "specialization": instance.specialization,
        "license_number": instance.license_number,
    }
    record_audit(
        user=instance.created_by,
        action=action,
        resource_type="Doctor",
        resource_id=instance.id,
        details=details,
    )


@receiver(post_delete, sender=Doctor)
def audit_doctor_delete(sender, instance, **kwargs):
    record_audit(
        user=instance.created_by,
        action="DELETE",
        resource_type="Doctor",
        resource_id=instance.id,
        details={"name": instance.name},
    )


@receiver(post_save, sender=PatientDoctorMapping)
def audit_mapping_save(sender, instance, created, **kwargs):
    action = "CREATE" if created else "UPDATE"
    details = {
        "patient_name": instance.patient.name,
        "doctor_name": instance.doctor.name,
        "is_primary": instance.is_primary,
        "status": instance.status,
    }
    record_audit(
        user=instance.patient.created_by,
        action=action,
        resource_type="PatientDoctorMapping",
        resource_id=instance.id,
        details=details,
    )


@receiver(post_delete, sender=PatientDoctorMapping)
def audit_mapping_delete(sender, instance, **kwargs):
    try:
        user = instance.patient.created_by
    except Exception:
        user = None
    record_audit(
        user=user,
        action="DELETE",
        resource_type="PatientDoctorMapping",
        resource_id=instance.id,
        details={
            "patient_id": getattr(instance, "patient_id", None),
            "doctor_id": getattr(instance, "doctor_id", None),
        },
    )
