from django.contrib import admin

from recommendations.models import Recommendation


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ("id", "pro", "client_name", "stars", "status", "created_at")
    list_filter = ("status",)
