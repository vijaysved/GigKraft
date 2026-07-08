"""Backfill Prospect.phone into the canonical "(XXX) XXX-XXXX" format.

Existing rows were entered by hand or CSV-imported in whatever format the
admin typed/pasted, since normalization didn't exist yet.
"""
from django.db import migrations


def backfill_phone_format(apps, schema_editor):
    from common.phone import normalize_phone

    Prospect = apps.get_model("vendors", "Prospect")
    for prospect in Prospect.objects.exclude(phone=""):
        normalized = normalize_phone(prospect.phone)
        if normalized != prospect.phone:
            Prospect.objects.filter(pk=prospect.pk).update(phone=normalized)


class Migration(migrations.Migration):

    dependencies = [
        ("vendors", "0009_prospect_signup_link_click_count_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_phone_format, migrations.RunPython.noop),
    ]
