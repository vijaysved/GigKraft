from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0009_pro_analytics"),
    ]

    operations = [
        migrations.CreateModel(
            name="WaitlistEntry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("email", models.EmailField(unique=True)),
                ("name", models.CharField(blank=True, default="", max_length=200)),
                ("google_sub", models.CharField(blank=True, default="", max_length=200)),
                (
                    "user_type",
                    models.CharField(
                        choices=[("general", "General"), ("pro", "Pro"), ("enterprise", "Enterprise")],
                        default="general",
                        max_length=20,
                    ),
                ),
                ("zipcode", models.CharField(blank=True, default="", max_length=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name_plural": "Waitlist entries",
                "ordering": ["-created_at"],
            },
        ),
    ]
