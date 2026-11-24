import django_filters

from apps.patients.models import Patient


class PatientFilter(django_filters.FilterSet):
    min_age = django_filters.NumberFilter(field_name="age", lookup_expr="gte")
    max_age = django_filters.NumberFilter(field_name="age", lookup_expr="lte")
    gender = django_filters.CharFilter(field_name="gender", lookup_expr="iexact")
    blood_group = django_filters.CharFilter(field_name="blood_group", lookup_expr="iexact")
    is_active = django_filters.BooleanFilter(field_name="is_active")

    class Meta:
        model = Patient
        fields = ["gender", "blood_group", "is_active", "min_age", "max_age"]
