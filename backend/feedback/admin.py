from django.contrib import admin

from feedback.models import Feedback, FeedbackReply


class ReplyInline(admin.TabularInline):
    model = FeedbackReply
    extra = 0
    readonly_fields = ("author", "created_at")


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("ticket_number", "status", "user", "page_url", "created_at")
    list_filter = ("status",)
    search_fields = ("ticket_number", "text", "user__email")
    readonly_fields = ("ticket_number", "created_at")
    inlines = [ReplyInline]
