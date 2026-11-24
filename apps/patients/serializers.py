import re

from rest_framework import serializers

from apps.patients.models import Patient


class PatientSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    gender_display = serializers.CharField(source="get_gender_display", read_only=True)

    class Meta:
        model = Patient
        fields = (
            "id",
            "name",
            "age",
            "gender",
            "gender_display",
            "dob",
            "blood_group",
            "phone",
            "email",
            "address",
            "medical_history",
            "allergies",
            "emergency_contact",
            "is_active",
            "is_deleted",
            "created_by_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "is_deleted",
            "created_by_email",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value):
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError("Patient name cannot be blank.")
        return trimmed

    def validate_age(self, value):
        if value < 0 or value > 150:
            raise serializers.ValidationError("Patient age must be between 0 and 150 years.")
        return value

    def validate_phone(self, value):
        if value:
            clean_phone = re.sub(r"[\s\-\(\)\+]", "", value)
            if not clean_phone.isdigit() or len(clean_phone) < 7:
                raise serializers.ValidationError(
                    "Please provide a valid phone number with at least 7 digits."
                )
        return value

    def create(self, validated_data):
        # Auto-attach created_by from request context
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class PatientAssignedDoctorSerializer(serializers.ModelSerializer):
    mapping_id = serializers.IntegerField(source="id", read_only=True)
    doctor_id = serializers.IntegerField(source="doctor.id", read_only=True)
    doctor_name = serializers.CharField(source="doctor.name", read_only=True)
    specialization = serializers.CharField(source="doctor.specialization", read_only=True)
    license_number = serializers.CharField(source="doctor.license_number", read_only=True)
    hospital = serializers.CharField(source="doctor.hospital", read_only=True)
    phone = serializers.CharField(source="doctor.phone", read_only=True)
    consultation_fee = serializers.DecimalField(
        source="doctor.consultation_fee", max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Patient
        fields = ()


class PatientDetailSerializer(PatientSerializer):
    assigned_doctors = serializers.SerializerMethodField()

    class Meta(PatientSerializer.Meta):
        fields = PatientSerializer.Meta.fields + ("assigned_doctors",)

    def get_assigned_doctors(self, obj):
        mappings = obj.mappings.select_related("doctor").all()
        result = []
        for m in mappings:
            result.append(
                {
                    "mapping_id": m.id,
                    "doctor_id": m.doctor.id,
                    "doctor_name": m.doctor.name,
                    "specialization": m.doctor.specialization,
                    "license_number": m.doctor.license_number,
                    "hospital": m.doctor.hospital,
                    "phone": m.doctor.phone,
                    "consultation_fee": str(m.doctor.consultation_fee),
                    "is_primary": m.is_primary,
                    "status": m.status,
                    "assigned_at": m.assigned_at,
                    "notes": m.notes,
                }
            )
        return result
