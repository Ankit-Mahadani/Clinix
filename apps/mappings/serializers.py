from rest_framework import serializers

from apps.mappings.models import PatientDoctorMapping


class PatientDoctorMappingSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.name", read_only=True)
    doctor_name = serializers.CharField(source="doctor.name", read_only=True)
    doctor_specialization = serializers.CharField(source="doctor.specialization", read_only=True)
    doctor_hospital = serializers.CharField(source="doctor.hospital", read_only=True)
    doctor_phone = serializers.CharField(source="doctor.phone", read_only=True)
    consultation_fee = serializers.DecimalField(
        source="doctor.consultation_fee", max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = PatientDoctorMapping
        fields = (
            "id",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "doctor_specialization",
            "doctor_hospital",
            "doctor_phone",
            "consultation_fee",
            "is_primary",
            "status",
            "notes",
            "assigned_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "assigned_at", "created_at", "updated_at")
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=PatientDoctorMapping.objects.all(),
                fields=("patient", "doctor"),
                message="This doctor is already assigned to this patient.",
            )
        ]

    def validate_patient(self, value):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")

        # Ensure patient belongs to requesting user
        if value.created_by_id != request.user.id or value.is_deleted:
            raise serializers.ValidationError("Specified patient does not exist in your account.")
        return value

    def validate(self, attrs):
        patient = attrs.get("patient")
        doctor = attrs.get("doctor")

        # Check duplicate assignment
        instance = getattr(self, "instance", None)
        qs = PatientDoctorMapping.objects.filter(patient=patient, doctor=doctor)
        if instance:
            qs = qs.exclude(pk=instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                {"detail": "This doctor is already assigned to this patient."},
                code="duplicate",
            )

        return attrs
