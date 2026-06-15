import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("billing", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="StripeSettings",
            fields=[
                ("id", models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("mode", models.CharField(choices=[("test", "Test"), ("live", "Live")], default="test", max_length=4)),
                ("test_price_monthly", models.CharField(blank=True, default="", max_length=100)),
                ("test_price_annual", models.CharField(blank=True, default="", max_length=100)),
                ("live_price_monthly", models.CharField(blank=True, default="", max_length=100)),
                ("live_price_annual", models.CharField(blank=True, default="", max_length=100)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "updated_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"verbose_name": "Stripe Settings", "verbose_name_plural": "Stripe Settings"},
        ),
    ]
