"""Backfill phone fields on ProInvite, ReferrerFollower, FriendInvite, and
CircleShareInvite into the canonical "(XXX) XXX-XXXX" format.

ReferrerFollower has a unique (referrer, phone) constraint, so two
differently-formatted rows for the same referrer that normalize to the same
number would collide — those are skipped and printed for manual review
rather than failing the whole migration.
"""
from django.db import IntegrityError, migrations, transaction


def backfill_phone_format(apps, schema_editor):
    from common.phone import normalize_phone

    ProInvite = apps.get_model("referrals", "ProInvite")
    ReferrerFollower = apps.get_model("referrals", "ReferrerFollower")
    FriendInvite = apps.get_model("referrals", "FriendInvite")
    CircleShareInvite = apps.get_model("referrals", "CircleShareInvite")

    for model in (ProInvite, FriendInvite, CircleShareInvite):
        for obj in model.objects.exclude(phone=""):
            normalized = normalize_phone(obj.phone)
            if normalized != obj.phone:
                model.objects.filter(pk=obj.pk).update(phone=normalized)

    for follower in ReferrerFollower.objects.exclude(phone=""):
        normalized = normalize_phone(follower.phone)
        if normalized == follower.phone:
            continue
        try:
            with transaction.atomic():
                ReferrerFollower.objects.filter(pk=follower.pk).update(phone=normalized)
        except IntegrityError:
            print(
                f"[phone-backfill] Skipped ReferrerFollower pk={follower.pk}: "
                f"'{follower.phone}' -> '{normalized}' collides with an existing row."
            )


class Migration(migrations.Migration):

    dependencies = [
        ("referrals", "0009_alter_circleshareinvite_phone_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_phone_format, migrations.RunPython.noop),
    ]
