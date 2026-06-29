from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("leads", "0005_lead_is_escrow"),
    ]

    operations = [
        migrations.CreateModel(
            name="ZipWaitlistEntry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("zip", models.CharField(max_length=5)),
                ("contact", models.CharField(max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("notified_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
