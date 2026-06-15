from django.contrib import admin

from krafts.models import Kraft, KraftPhoto


class KraftPhotoInline(admin.TabularInline):
    model = KraftPhoto
    extra = 0


@admin.register(Kraft)
class KraftAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "pro", "node", "status", "invoice_cost")
    list_filter = ("status", "node")
    inlines = [KraftPhotoInline]
