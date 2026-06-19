"""
Migrate VendorContact → Prospect.

Field renames: vendor_id→prospect_id, contact_person→name, lead_source→source
Status values: new/contacted/in_conversation/follow_up→prospect/in_progress, onboarded→converted, not_interested→abandoned
Source values: whatsapp_friends/whatsapp_family→whatsapp, referral/other→direct
New fields: primary_zip, neighborhood, role, current_sequence_step, last_contacted_at,
            signup_link_token, link_clicked_at, converted_user
Removed fields: business_name, category, nextdoor_profile_url, preferred_channel,
                last_contact_date, last_seen
"""
import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


STATUS_MAP = {
    "new": "prospect",
    "contacted": "in_progress",
    "in_conversation": "in_progress",
    "follow_up": "in_progress",
    "onboarded": "converted",
    "not_interested": "abandoned",
}

SOURCE_MAP = {
    "whatsapp_friends": "whatsapp",
    "whatsapp_family": "whatsapp",
    "referral": "direct",
    "other": "direct",
}


def migrate_values(apps, schema_editor):
    Prospect = apps.get_model("vendors", "Prospect")
    for old, new in STATUS_MAP.items():
        Prospect.objects.filter(status=old).update(status=new)
    for old, new in SOURCE_MAP.items():
        Prospect.objects.filter(source=old).update(source=new)


def generate_tokens(apps, schema_editor):
    Prospect = apps.get_model("vendors", "Prospect")
    for p in Prospect.objects.filter(signup_link_token__isnull=True):
        p.signup_link_token = uuid.uuid4()
        p.save(update_fields=["signup_link_token"])


class Migration(migrations.Migration):
    dependencies = [
        ("vendors", "0004_last_seen_tags_pageview"),
        ("accounts", "0009_pro_analytics"),
    ]

    operations = [
        # ── 1. Rename model ───────────────────────────────────────────────────
        migrations.RenameModel("VendorContact", "Prospect"),

        # ── 2. Rename fields ──────────────────────────────────────────────────
        migrations.RenameField("Prospect", "vendor_id", "prospect_id"),
        migrations.RenameField("Prospect", "contact_person", "name"),
        migrations.RenameField("Prospect", "lead_source", "source"),

        # ── 3. Remove obsolete fields ─────────────────────────────────────────
        migrations.RemoveField("Prospect", "business_name"),
        migrations.RemoveField("Prospect", "category"),
        migrations.RemoveField("Prospect", "nextdoor_profile_url"),
        migrations.RemoveField("Prospect", "preferred_channel"),
        migrations.RemoveField("Prospect", "last_contact_date"),
        migrations.RemoveField("Prospect", "last_seen"),
        migrations.RemoveField("Prospect", "tags"),

        # ── 4. Update choices on existing fields ──────────────────────────────
        migrations.AlterField(
            model_name="Prospect",
            name="status",
            field=models.CharField(
                max_length=20,
                choices=[
                    ("prospect", "Prospect"),
                    ("in_progress", "In Progress"),
                    ("converted", "Converted"),
                    ("on_hold", "On Hold"),
                    ("abandoned", "Abandoned"),
                ],
                default="prospect",
            ),
        ),
        migrations.AlterField(
            model_name="Prospect",
            name="source",
            field=models.CharField(
                max_length=20,
                choices=[
                    ("nextdoor", "Nextdoor"),
                    ("craigslist", "Craigslist"),
                    ("whatsapp", "WhatsApp"),
                    ("direct", "Direct"),
                ],
                default="nextdoor",
            ),
        ),

        # ── 5. Add new fields ─────────────────────────────────────────────────
        migrations.AddField(
            model_name="Prospect",
            name="primary_zip",
            field=models.CharField(max_length=10, blank=True, default=""),
        ),
        migrations.AddField(
            model_name="Prospect",
            name="neighborhood",
            field=models.CharField(max_length=200, blank=True, default=""),
        ),
        migrations.AddField(
            model_name="Prospect",
            name="role",
            field=models.CharField(
                max_length=20,
                choices=[("pro", "Pro"), ("homeowner", "Homeowner")],
                default="pro",
            ),
        ),
        migrations.AddField(
            model_name="Prospect",
            name="current_sequence_step",
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="Prospect",
            name="last_contacted_at",
            field=models.DateTimeField(null=True, blank=True),
        ),
        # nullable + no default so PostgreSQL doesn't evaluate uuid4() once for all rows
        migrations.AddField(
            model_name="Prospect",
            name="signup_link_token",
            field=models.UUIDField(null=True, editable=False),
        ),
        migrations.AddField(
            model_name="Prospect",
            name="link_clicked_at",
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="Prospect",
            name="converted_user",
            field=models.ForeignKey(
                settings.AUTH_USER_MODEL,
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="converted_prospects",
            ),
        ),

        # ── 6. Data migrations ────────────────────────────────────────────────
        migrations.RunPython(migrate_values, migrations.RunPython.noop),
        migrations.RunPython(generate_tokens, migrations.RunPython.noop),

        # ── 7. Make signup_link_token non-nullable ────────────────────────────
        migrations.AlterField(
            model_name="Prospect",
            name="signup_link_token",
            field=models.UUIDField(default=uuid.uuid4, unique=True, editable=False),
        ),

        # ── 8. Add composite index ────────────────────────────────────────────
        migrations.AddIndex(
            model_name="Prospect",
            index=models.Index(
                fields=["status", "current_sequence_step", "last_contacted_at"],
                name="prospect_seq_idx",
            ),
        ),
    ]
