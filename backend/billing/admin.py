from django.contrib import admin

from billing.models import BillingInvoice, Coupon, Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "pro", "plan", "status", "renews_at")


@admin.register(BillingInvoice)
class BillingInvoiceAdmin(admin.ModelAdmin):
    list_display = ("id", "subscription", "amount", "status", "issued_at")


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_pct", "is_active")
