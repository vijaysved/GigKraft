from django.contrib import admin

from emergencies.models import BroadcastDispatch, EmergencyBroadcast


class DispatchInline(admin.TabularInline):
    model = BroadcastDispatch
    extra = 0


@admin.register(EmergencyBroadcast)
class EmergencyBroadcastAdmin(admin.ModelAdmin):
    list_display = ("id", "kind", "homeowner", "status", "claimed_by", "created_at")
    list_filter = ("status", "kind", "node")
    inlines = [DispatchInline]
