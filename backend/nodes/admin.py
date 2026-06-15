from django.contrib import admin

from nodes.models import Node


@admin.register(Node)
class NodeAdmin(admin.ModelAdmin):
    list_display = ("node_id", "name", "center_zip", "radius_miles", "is_active")
    search_fields = ("node_id", "name", "center_zip")
    list_filter = ("is_active",)
