import secrets

import django.db.models.deletion
from django.db import migrations, models


def populate_friend_invite_tokens(apps, schema_editor):
    FriendInvite = apps.get_model("referrals", "FriendInvite")
    for fi in FriendInvite.objects.filter(token=""):
        fi.token = secrets.token_urlsafe(11)
        fi.save(update_fields=["token"])


class Migration(migrations.Migration):

    dependencies = [
        ("referrals", "0002_referrerprofile_notifications_slug_lock"),
    ]

    operations = [
        # ── ProInvite additions ──────────────────────────────────────────────
        migrations.AlterField(
            model_name="proinvite",
            name="trade",
            field=models.CharField(blank=True, default="", max_length=60),
        ),
        migrations.AddField(
            model_name="proinvite",
            name="channel",
            field=models.CharField(blank=True, default="", max_length=10),
        ),
        migrations.AddField(
            model_name="proinvite",
            name="click_count",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="proinvite",
            name="last_resent_at",
            field=models.DateTimeField(blank=True, null=True),
        ),

        # ── FriendInvite additions ───────────────────────────────────────────
        migrations.AddField(
            model_name="friendinvite",
            name="channel",
            field=models.CharField(blank=True, default="", max_length=10),
        ),
        migrations.AddField(
            model_name="friendinvite",
            name="click_count",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="friendinvite",
            name="last_resent_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        # Step 1: add token as non-unique with a default (safe for existing rows)
        migrations.AddField(
            model_name="friendinvite",
            name="token",
            field=models.CharField(default="", max_length=32),
            preserve_default=False,
        ),
        # Step 2: populate tokens for any existing rows
        migrations.RunPython(
            populate_friend_invite_tokens,
            reverse_code=migrations.RunPython.noop,
        ),
        # Step 3: add unique constraint + index
        migrations.AlterField(
            model_name="friendinvite",
            name="token",
            field=models.CharField(db_index=True, max_length=32, unique=True),
        ),
    ]
