from django.contrib import admin

from vendors.models import EmailTemplate, VendorCommunication, VendorContact


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


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "kind", "is_default", "created_at")
    list_filter = ("kind", "is_default")
    search_fields = ("name", "subject")


@admin.register(VendorCommunication)
class VendorCommunicationAdmin(admin.ModelAdmin):
    list_display = ("vendor", "channel", "template", "sent_at")
    list_filter = ("channel",)
    search_fields = ("vendor__contact_person", "subject_sent")
