from django.views.generic import TemplateView

class IndexView(TemplateView):
    template_name = "auth/index.html"

class AppView(TemplateView):
    template_name = "dashboard/home.html"
