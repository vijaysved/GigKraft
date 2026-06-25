from django.contrib import admin

from circles.models import Circle, CircleAnalyticsEvent, CirclePro, CircleReferral


class CircleProInline(admin.TabularInline):
    model = CirclePro
    extra = 0
    readonly_fields = ("added_at", "invitation_sent_at")


@admin.register(Circle)
class CircleAdmin(admin.ModelAdmin):
    list_display = ("slug", "curator", "is_active", "created_at")
    search_fields = ("slug", "curator__email", "curator__first_name", "curator__last_name")
    list_filter = ("is_active",)
    readonly_fields = ("slug", "created_at", "updated_at")
    inlines = [CircleProInline]


@admin.register(CirclePro)
class CircleProAdmin(admin.ModelAdmin):
    list_display = ("circle", "display_name_col", "status", "is_off_platform_col", "added_at")
    list_filter = ("status",)
    search_fields = ("circle__slug", "off_platform_name", "pro__user__email")

    @admin.display(description="Name")
    def display_name_col(self, obj):
        return obj.display_name

    @admin.display(description="Off-platform", boolean=True)
    def is_off_platform_col(self, obj):
        return obj.is_off_platform


@admin.register(CircleReferral)
class CircleReferralAdmin(admin.ModelAdmin):
    list_display = ("circle", "lead", "created_at")
    readonly_fields = ("created_at",)


@admin.register(CircleAnalyticsEvent)
class CircleAnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ("circle", "event_type", "created_at")
    list_filter = ("event_type",)
    readonly_fields = ("created_at",)
