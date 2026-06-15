from django.contrib import admin

from leads.models import Lead, Message, Quote


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0


class QuoteInline(admin.TabularInline):
    model = Quote
    extra = 0


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("id", "job_title", "homeowner", "pro", "status", "respond_by")
    list_filter = ("status", "node")
    inlines = [MessageInline, QuoteInline]
