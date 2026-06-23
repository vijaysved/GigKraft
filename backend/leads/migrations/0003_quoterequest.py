from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("leads", "0002_lead_thread_type"),
    ]

    operations = [
        migrations.CreateModel(
            name="QuoteRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("description", models.TextField()),
                ("category", models.CharField(max_length=60)),
                ("subcategory", models.CharField(blank=True, default="", max_length=80)),
                ("timeline", models.CharField(choices=[("this_week", "This week"), ("next_month", "Next month"), ("just_planning", "Just planning")], max_length=20)),
                ("zip_code", models.CharField(max_length=10)),
                ("budget", models.CharField(choices=[("no_pref", "No preference"), ("under_500", "Under $500"), ("500_2k", "$500–2k"), ("2k_10k", "$2k–10k"), ("over_10k", "$10k+")], default="no_pref", max_length=20)),
                ("requester_name", models.CharField(max_length=120)),
                ("requester_contact", models.CharField(max_length=200)),
                ("notified_pro_ids", models.JSONField(default=list)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
