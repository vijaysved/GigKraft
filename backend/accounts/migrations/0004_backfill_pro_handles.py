"""Backfill handles for existing ProProfile rows that pre-date the handle field."""
from django.db import migrations


def backfill_handles(apps, schema_editor):
    ProProfile = apps.get_model("accounts", "ProProfile")
    # Use the live model (not the historical stub) so _generate_handle is available.
    from accounts.models import ProProfile as LiveProProfile
    for stub in ProProfile.objects.filter(handle__isnull=True):
        live = LiveProProfile.objects.get(pk=stub.pk)
        if not live.handle:
            live.save()


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_add_pro_handle"),
    ]

    operations = [
        migrations.RunPython(backfill_handles, migrations.RunPython.noop),
    ]
