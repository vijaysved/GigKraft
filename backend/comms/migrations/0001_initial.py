import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("vendors", "0002_email_templates_and_communications"),
    ]

    operations = [
        migrations.CreateModel(
            name="MessageTemplate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("channel", models.CharField(
                    choices=[("email", "Email"), ("whatsapp", "WhatsApp")],
                    default="email",
                    max_length=10,
                )),
                ("kind", models.CharField(
                    choices=[("intro", "Intro"), ("reminder", "Reminder"), ("onboarding", "Onboarding"), ("other", "Other")],
                    default="intro",
                    max_length=20,
                )),
                ("subject", models.CharField(blank=True, default="", max_length=300)),
                ("body", models.TextField()),
                ("is_default", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["channel", "kind", "name"]},
        ),
        migrations.CreateModel(
            name="OutreachLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("channel", models.CharField(
                    choices=[("email", "Email"), ("whatsapp", "WhatsApp"), ("sms", "SMS"), ("other", "Other")],
                    default="email",
                    max_length=10,
                )),
                ("to_address", models.CharField(blank=True, default="", max_length=300)),
                ("cc_addresses", models.CharField(blank=True, default="", max_length=500)),
                ("subject_sent", models.CharField(blank=True, default="", max_length=300)),
                ("body_sent", models.TextField(blank=True, default="")),
                ("resend_id", models.CharField(blank=True, default="", max_length=100)),
                ("notes", models.TextField(blank=True, default="")),
                ("sent_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("prospect", models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="outreach_logs",
                    to="vendors.vendorcontact",
                )),
                ("template", models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="logs",
                    to="comms.messagetemplate",
                )),
            ],
            options={"ordering": ["-sent_at"]},
        ),
    ]
