from django.contrib import admin

from vendors.models import VendorContact


@admin.register(VendorContact)
class VendorContactAdmin(admin.ModelAdmin):
    list_display = (
        "vendor_id",
        "contact_person",
        "business_name",
        "category",
        "status",
        "lead_source",
        "last_contact_date",
    )
    list_filter = ("status", "lead_source", "preferred_channel")
    search_fields = ("contact_person", "business_name", "email", "phone")
    readonly_fields = ("vendor_id", "created_at", "updated_at")
