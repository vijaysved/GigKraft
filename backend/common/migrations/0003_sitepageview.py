from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [
        ("common", "0002_sitesettings_member_urls"),
    ]

    operations = [
        migrations.CreateModel(
            name="SitePageView",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("url", models.CharField(db_index=True, max_length=500)),
                ("referrer", models.CharField(blank=True, default="", max_length=500)),
                ("visited_at", models.DateTimeField(db_index=True, default=django.utils.timezone.now)),
            ],
            options={
                "ordering": ["-visited_at"],
            },
        ),
    ]
