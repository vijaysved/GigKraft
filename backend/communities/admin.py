from django.contrib import admin

from communities.models import (
    Community,
    CommunityAnalyticsEvent,
    CommunityMember,
    CommunityReferral,
)


class CommunityMemberInline(admin.TabularInline):
    model = CommunityMember
    extra = 0
    readonly_fields = ("token", "invited_at", "joined_at", "click_count")


@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ("slug", "name", "lead", "status", "created_at")
    search_fields = ("slug", "name", "lead__email", "lead__first_name", "lead__last_name")
    list_filter = ("status",)
    readonly_fields = ("slug", "short_code", "created_at", "updated_at")
    inlines = [CommunityMemberInline]


@admin.register(CommunityMember)
class CommunityMemberAdmin(admin.ModelAdmin):
    list_display = ("community", "name", "role", "status", "click_count", "invited_at")
    list_filter = ("role", "status")
    search_fields = ("community__slug", "name", "phone", "email")
    readonly_fields = ("token", "invited_at", "joined_at")


@admin.register(CommunityReferral)
class CommunityReferralAdmin(admin.ModelAdmin):
    list_display = ("community", "lead", "created_at")
    readonly_fields = ("created_at",)


@admin.register(CommunityAnalyticsEvent)
class CommunityAnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ("community", "event_type", "created_at")
    list_filter = ("event_type",)
    readonly_fields = ("created_at",)
