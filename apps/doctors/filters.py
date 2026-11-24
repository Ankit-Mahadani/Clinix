import django_filters
from apps.doctors.models import Doctor


class DoctorFilter(django_filters.FilterSet):
    specialization = django_filters.CharFilter(
        field_name="specialization", lookup_expr="icontains"
    )
    is_active = django_filters.BooleanFilter(field_name="is_active")
    min_experience = django_filters.NumberFilter(
        field_name="years_of_experience", lookup_expr="gte"
    )
    max_fee = django_filters.NumberFilter(
        field_name="consultation_fee", lookup_expr="lte"
    )
    hospital = django_filters.CharFilter(field_name="hospital", lookup_expr="icontains")

    class Meta:
        model = Doctor
        fields = [
            "specialization",
            "is_active",
            "min_experience",
            "max_fee",
            "hospital",
        ]
