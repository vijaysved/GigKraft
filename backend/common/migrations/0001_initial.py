from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="SiteSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "template_pro_url_local",
                    models.URLField(
                        default="http://localhost:5173/pros/stephan-carry",
                        help_text="Template pro profile URL used in local/dev environment.",
                        max_length=500,
                    ),
                ),
                (
                    "template_pro_url_prod",
                    models.URLField(
                        default="https://www.gigkraft.com/pros/chris-karry",
                        help_text="Template pro profile URL used in production.",
                        max_length=500,
                    ),
                ),
                (
                    "extra_template_urls",
                    models.JSONField(
                        blank=True,
                        default=list,
                        help_text='Additional named template URLs, e.g. [{"label": "Home demo", "url": "https://..."}]',
                    ),
                ),
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
            options={
                "verbose_name": "Site Settings",
                "verbose_name_plural": "Site Settings",
            },
        ),
    ]
