from rest_framework import serializers

from apps.doctors.models import Doctor


class DoctorSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)
    is_creator = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = (
            "id",
            "name",
            "specialization",
            "license_number",
            "years_of_experience",
            "hospital",
            "phone",
            "email",
            "consultation_fee",
            "availability",
            "is_active",
            "created_by_email",
            "is_creator",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_by_email",
            "is_creator",
            "created_at",
            "updated_at",
        )

    def get_is_creator(self, obj):
        request = self.context.get("request")
        if request and hasattr(request, "user") and request.user.is_authenticated:
            return obj.created_by_id == request.user.id
        return False

    def validate_name(self, value):
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError("Doctor name cannot be blank.")
        return trimmed

    def validate_specialization(self, value):
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError("Specialization cannot be blank.")
        return trimmed

    def validate_license_number(self, value):
        trimmed = value.strip().upper()
        if not trimmed:
            raise serializers.ValidationError("License number cannot be blank.")
        # Check uniqueness on update/create
        instance = getattr(self, "instance", None)
        qs = Doctor.objects.filter(license_number__iexact=trimmed)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "A doctor with this medical license number already exists."
            )
        return trimmed

    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["created_by"] = request.user
        return super().create(validated_data)
