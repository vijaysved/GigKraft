import uuid
from django.db import migrations, models


def generate_tokens(apps, schema_editor):
    """Generate a unique UUID for each existing OutreachLog row."""
    OutreachLog = apps.get_model("comms", "OutreachLog")
    for log in OutreachLog.objects.filter(email_track_token__isnull=True):
        log.email_track_token = uuid.uuid4()
        log.save(update_fields=["email_track_token"])


class Migration(migrations.Migration):
    dependencies = [
        ("comms", "0003_update_prospect_fk_and_seed_sequences"),
    ]

    operations = [
        migrations.AddField(
            model_name="OutreachLog",
            name="sequence_step",
            field=models.PositiveSmallIntegerField(default=0),
        ),
        # Step 1: add column as nullable with NO unique — existing rows get NULL
        migrations.AddField(
            model_name="OutreachLog",
            name="email_track_token",
            field=models.UUIDField(null=True, editable=False),
        ),
        migrations.AddField(
            model_name="OutreachLog",
            name="read_at",
            field=models.DateTimeField(null=True, blank=True),
        ),
        # Step 2: generate unique UUIDs for existing rows via Python (one per row)
        migrations.RunPython(generate_tokens, migrations.RunPython.noop),
        # Step 3: add unique constraint now that all rows have distinct values
        migrations.AlterField(
            model_name="OutreachLog",
            name="email_track_token",
            field=models.UUIDField(default=uuid.uuid4, unique=True, null=True, editable=False),
        ),
    ]
