import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("vendors", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="EmailTemplate",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=120)),
                (
                    "kind",
                    models.CharField(
                        choices=[
                            ("intro", "Intro"),
                            ("reminder", "Reminder"),
                            ("onboarding", "Onboarding"),
                            ("other", "Other"),
                        ],
                        default="intro",
                        max_length=20,
                    ),
                ),
                ("subject", models.CharField(max_length=300)),
                ("body", models.TextField()),
                (
                    "is_default",
                    models.BooleanField(
                        default=False,
                        help_text="Mark one intro and one reminder template as the default for quick-send.",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["kind", "name"],
            },
        ),
        migrations.CreateModel(
            name="VendorCommunication",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "channel",
                    models.CharField(
                        choices=[
                            ("email", "Email"),
                            ("whatsapp", "WhatsApp"),
                            ("sms", "SMS"),
                            ("nextdoor_dm", "Nextdoor DM"),
                            ("phone", "Phone Call"),
                            ("other", "Other"),
                        ],
                        default="email",
                        max_length=15,
                    ),
                ),
                (
                    "subject_sent",
                    models.CharField(blank=True, default="", max_length=300),
                ),
                ("body_sent", models.TextField(blank=True, default="")),
                ("notes", models.TextField(blank=True, default="")),
                (
                    "sent_at",
                    models.DateTimeField(default=django.utils.timezone.now),
                ),
                (
                    "vendor",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="communications",
                        to="vendors.vendorcontact",
                    ),
                ),
                (
                    "template",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="communications",
                        to="vendors.emailtemplate",
                    ),
                ),
            ],
            options={
                "ordering": ["-sent_at"],
            },
        ),
    ]
