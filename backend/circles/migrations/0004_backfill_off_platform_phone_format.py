"""Backfill CirclePro.off_platform_phone into the canonical "(XXX) XXX-XXXX" format."""
from django.db import migrations


def backfill_phone_format(apps, schema_editor):
    from common.phone import normalize_phone

    CirclePro = apps.get_model("circles", "CirclePro")
    for cp in CirclePro.objects.exclude(off_platform_phone=""):
        normalized = normalize_phone(cp.off_platform_phone)
        if normalized != cp.off_platform_phone:
            CirclePro.objects.filter(pk=cp.pk).update(off_platform_phone=normalized)


class Migration(migrations.Migration):

    dependencies = [
        ("circles", "0003_circlefollow"),
    ]

    operations = [
        migrations.RunPython(backfill_phone_format, migrations.RunPython.noop),
    ]
