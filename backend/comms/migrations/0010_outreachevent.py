from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    dependencies = [("comms", "0009_outreachlog_example_clicked_at")]

    operations = [
        migrations.CreateModel(
            name="OutreachEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("log", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="events", to="comms.outreachlog")),
                ("event_type", models.CharField(choices=[("email_open", "Email Open"), ("profile_view", "Profile View")], max_length=20)),
                ("occurred_at", models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={"ordering": ["occurred_at"]},
        ),
    ]
