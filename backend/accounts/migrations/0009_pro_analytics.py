from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0008_homeownerprofile_preferred_trade"),
        ("krafts", "0006_description_max_length"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ProProfileView",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("viewer_zip", models.CharField(blank=True, default="", max_length=10)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("pro", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="profile_views", to="accounts.proprofile")),
                ("viewer", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="+", to=settings.AUTH_USER_MODEL)),
            ],
            options={"indexes": [models.Index(fields=["pro", "created_at"], name="accounts_pr_pro_id_creat_idx")]},
        ),
        migrations.CreateModel(
            name="KraftImpression",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("kraft", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="impressions", to="krafts.kraft")),
                ("pro", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="kraft_impressions", to="accounts.proprofile")),
                ("viewer", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="+", to=settings.AUTH_USER_MODEL)),
            ],
            options={"indexes": [
                models.Index(fields=["pro", "created_at"], name="accounts_ki_pro_id_creat_idx"),
                models.Index(fields=["kraft", "created_at"], name="accounts_ki_kraft_id_creat_idx"),
            ]},
        ),
        migrations.CreateModel(
            name="KraftClick",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("kraft", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="clicks", to="krafts.kraft")),
                ("pro", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="kraft_clicks", to="accounts.proprofile")),
                ("viewer", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="+", to=settings.AUTH_USER_MODEL)),
            ],
            options={"indexes": [
                models.Index(fields=["pro", "created_at"], name="accounts_kc_pro_id_creat_idx"),
                models.Index(fields=["kraft", "created_at"], name="accounts_kc_kraft_id_creat_idx"),
            ]},
        ),
    ]
