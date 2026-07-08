"""Backfill User.phone into the canonical "(XXX) XXX-XXXX" format.

Existing rows were saved with whatever format the client sent (raw digits,
dashes, +1 prefix, etc.) since normalization didn't exist yet. `phone` is
unique, so two differently-formatted rows that normalize to the same number
would collide — those are skipped and printed so they can be reconciled by
hand rather than failing the whole migration.
"""
from django.db import IntegrityError, migrations, transaction


def backfill_phone_format(apps, schema_editor):
    from common.phone import normalize_phone

    User = apps.get_model("accounts", "User")
    for user in User.objects.exclude(phone__isnull=True).exclude(phone=""):
        normalized = normalize_phone(user.phone)
        if normalized == user.phone:
            continue
        try:
            with transaction.atomic():
                User.objects.filter(pk=user.pk).update(phone=normalized)
        except IntegrityError:
            print(
                f"[phone-backfill] Skipped User pk={user.pk}: "
                f"'{user.phone}' -> '{normalized}' collides with an existing row."
            )


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0020_alter_user_role"),
    ]

    operations = [
        migrations.RunPython(backfill_phone_format, migrations.RunPython.noop),
    ]
