from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="VendorContact",
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
                    "vendor_id",
                    models.CharField(blank=True, max_length=12, unique=True),
                ),
                ("business_name", models.CharField(blank=True, default="", max_length=200)),
                ("contact_person", models.CharField(max_length=200)),
                ("category", models.CharField(blank=True, default="", max_length=80)),
                (
                    "lead_source",
                    models.CharField(
                        choices=[
                            ("nextdoor", "Nextdoor"),
                            ("whatsapp_friends", "WhatsApp (Friends)"),
                            ("whatsapp_family", "WhatsApp (Family)"),
                            ("referral", "Referral"),
                            ("other", "Other"),
                        ],
                        default="nextdoor",
                        max_length=20,
                    ),
                ),
                ("phone", models.CharField(blank=True, default="", max_length=30)),
                ("email", models.EmailField(blank=True, default="", max_length=254)),
                (
                    "nextdoor_profile_url",
                    models.URLField(blank=True, default=""),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("new", "New"),
                            ("contacted", "Contacted"),
                            ("in_conversation", "In Conversation"),
                            ("follow_up", "Follow-up Needed"),
                            ("onboarded", "Onboarded"),
                            ("not_interested", "Not Interested"),
                        ],
                        default="new",
                        max_length=20,
                    ),
                ),
                (
                    "preferred_channel",
                    models.CharField(
                        choices=[
                            ("whatsapp", "WhatsApp"),
                            ("sms", "SMS"),
                            ("email", "Email"),
                            ("nextdoor_dm", "Nextdoor DM"),
                        ],
                        default="whatsapp",
                        max_length=15,
                    ),
                ),
                ("last_contact_date", models.DateField(blank=True, null=True)),
                ("notes", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
