from django.urls import path
from apps.mappings.views import MappingDetailView, MappingListCreateView

app_name = "mappings"

urlpatterns = [
    path("", MappingListCreateView.as_view(), name="mapping_list_create"),
    path("<int:pk>/", MappingDetailView.as_view(), name="mapping_detail"),
]
