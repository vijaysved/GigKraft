import uuid
from django.db import migrations, models


def generate_click_tokens(apps, schema_editor):
    OutreachLog = apps.get_model("comms", "OutreachLog")
    for log in OutreachLog.objects.filter(link_click_token__isnull=True):
        log.link_click_token = uuid.uuid4()
        log.save(update_fields=["link_click_token"])


class Migration(migrations.Migration):
    dependencies = [
        ("comms", "0004_outreachlog_tracking"),
    ]

    operations = [
        migrations.AddField(
            model_name="outreachlog",
            name="link_click_token",
            field=models.UUIDField(null=True, editable=False),
        ),
        migrations.AddField(
            model_name="outreachlog",
            name="link_clicked_at",
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.RunPython(generate_click_tokens, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="outreachlog",
            name="link_click_token",
            field=models.UUIDField(default=uuid.uuid4, unique=True, null=True, editable=False),
        ),
    ]
