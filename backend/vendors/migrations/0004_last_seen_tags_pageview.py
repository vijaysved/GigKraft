from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("vendors", "0003_remove_emailtemplate_vendorcommunication"),
    ]

    operations = [
        migrations.AddField(
            model_name="vendorcontact",
            name="last_seen",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="vendorcontact",
            name="tags",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.CreateModel(
            name="ProPageView",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("pro_handle", models.CharField(db_index=True, max_length=30)),
                (
                    "prospect",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="page_views",
                        to="vendors.vendorcontact",
                    ),
                ),
                ("viewed_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-viewed_at"]},
        ),
    ]
