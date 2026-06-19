from django.contrib import admin

from vendors.models import Prospect, ProPageView


@admin.register(Prospect)
class ProspectAdmin(admin.ModelAdmin):
    list_display = ("prospect_id", "name", "email", "source", "status", "current_sequence_step", "last_contacted_at")
    list_filter = ("status", "source", "role")
    search_fields = ("name", "email", "phone", "prospect_id")
    readonly_fields = ("prospect_id", "signup_link_token", "created_at", "updated_at")


@admin.register(ProPageView)
class ProPageViewAdmin(admin.ModelAdmin):
    list_display = ("pro_handle", "prospect", "viewed_at")
    readonly_fields = ("viewed_at",)
