from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("accounts", "0016_favoritepro"),
        ("leads", "0005_lead_is_escrow"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Circle",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("slug", models.SlugField(max_length=80, unique=True)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "curator",
                    models.OneToOneField(
                        limit_choices_to={"role": "homeowner"},
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="circle",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"ordering": ["slug"]},
        ),
        migrations.CreateModel(
            name="CirclePro",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("off_platform_name", models.CharField(blank=True, default="", max_length=120)),
                ("off_platform_skill", models.CharField(blank=True, default="", max_length=80)),
                ("off_platform_phone", models.CharField(blank=True, default="", max_length=30)),
                ("off_platform_email", models.EmailField(blank=True, default="")),
                ("endorsement", models.CharField(blank=True, default="", max_length=160)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("active", "Active"),
                            ("pending", "Pending (off-platform, not yet joined)"),
                            ("claimed", "Claimed (off-platform pro has registered)"),
                        ],
                        default="active",
                        max_length=10,
                    ),
                ),
                ("invitation_sent_at", models.DateTimeField(blank=True, null=True)),
                ("added_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "circle",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="pros",
                        to="circles.circle",
                    ),
                ),
                (
                    "pro",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="circle_memberships",
                        to="accounts.proprofile",
                    ),
                ),
            ],
            options={"ordering": ["added_at"]},
        ),
        migrations.AddConstraint(
            model_name="circlepro",
            constraint=models.UniqueConstraint(
                condition=models.Q(pro__isnull=False),
                fields=["circle", "pro"],
                name="unique_circle_pro",
            ),
        ),
        migrations.CreateModel(
            name="CircleReferral",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "circle",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="referrals",
                        to="circles.circle",
                    ),
                ),
                (
                    "lead",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="circle_referral",
                        to="leads.lead",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="CircleAnalyticsEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "event_type",
                    models.CharField(
                        choices=[
                            ("page_view", "Page View"),
                            ("search", "Search"),
                            ("request_submitted", "Request Submitted"),
                        ],
                        max_length=20,
                    ),
                ),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "circle",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="analytics_events",
                        to="circles.circle",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="circleanalyticsevent",
            index=models.Index(
                fields=["circle", "event_type", "created_at"],
                name="circles_cir_circle__idx",
            ),
        ),
    ]
