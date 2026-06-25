from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0016_favoritepro"),
        ("circles", "0002_backfill_circles_for_homeowners"),
    ]

    operations = [
        migrations.CreateModel(
            name="CircleFollow",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("status", models.CharField(
                    choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")],
                    default="pending",
                    max_length=10,
                )),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("circle", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="follow_requests",
                    to="circles.circle",
                )),
                ("follower", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="circle_follows",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddConstraint(
            model_name="circlefollow",
            constraint=models.UniqueConstraint(
                fields=["circle", "follower"],
                name="unique_circle_follow",
            ),
        ),
    ]
