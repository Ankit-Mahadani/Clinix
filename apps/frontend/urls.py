from django.urls import path

from apps.frontend.views import AppView, IndexView

app_name = "frontend"

urlpatterns = [
    path("", IndexView.as_view(), name="landing"),
    path("app/", AppView.as_view(), name="app"),
]
