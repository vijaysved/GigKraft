from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from accounts.models import HomeownerProfile, ProProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("id",)
    list_display = ("id", "email", "phone", "role", "node", "is_active", "is_staff")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "phone", "first_name", "last_name")
    fieldsets = (
        (None, {"fields": ("email", "phone", "password")}),
        ("Profile", {"fields": ("first_name", "last_name", "role", "node")}),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups")},
        ),
        ("Dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "phone", "role", "password1", "password2"),
            },
        ),
    )


@admin.register(ProProfile)
class ProProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "business_name", "base_zip", "service_radius_miles")
    search_fields = ("user__email", "user__phone", "business_name", "base_zip")


@admin.register(HomeownerProfile)
class HomeownerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "default_zip", "dispatch_opt_in")
    search_fields = ("user__email", "user__phone", "default_zip")
