"""
Update OutreachLog.prospect FK to point to vendors.Prospect (renamed from VendorContact).
Add sequence_1/2/3 kind choices to MessageTemplate.
Seed the 3 automated email sequence templates.
"""
import django.db.models.deletion
from django.db import migrations, models

SEQUENCE_TEMPLATES = [
    {
        "name": "Sequence Step 1 — The Hook",
        "channel": "email",
        "kind": "sequence_1",
        "is_default": True,
        "subject": "Showcase your work to local homeowners (GigKraft)",
        "body": (
            "Hi {{name}},\n\n"
            "I came across your services on {{source}} and wanted to reach out. "
            "I'm Vijay, one of the admins at GigKraft—a local community platform built specifically "
            "for trusted, independent pros in the {{primaryZip}} area.\n\n"
            "Unlike traditional bidding networks that eat into your margins or charge you for fake leads, "
            "GigKraft acts as your sovereign digital portfolio. It's an independent reference layer where "
            "you own your local reputation, showcase past projects, and let homeowners verify your work directly.\n\n"
            "We keep things simple and completely transparent: it's $24.99/month or $249.99/year to host "
            "your verified profile. No hidden transaction fees, and zero payment for leads.\n\n"
            "If you're open to securing more local jobs through real local word-of-mouth, "
            "you can claim your profile here: {{signup_link}}\n\n"
            "Best regards,\n\nVijay\nGK Admin, GigKraft"
        ),
    },
    {
        "name": "Sequence Step 2 — Value & Control",
        "channel": "email",
        "kind": "sequence_2",
        "is_default": True,
        "subject": "Own your professional reputation, {{name}}",
        "body": (
            "Hi {{name}},\n\n"
            "Just following up on my note from a few days ago.\n\n"
            "A lot of local pros tell us they are tired of corporate platforms shifting algorithms "
            "or hiding their best client reviews behind expensive paywalls. With GigKraft, your profile "
            "is yours to keep and share anywhere—whether you're talking to clients on WhatsApp, "
            "Nextdoor, or Craigslist.\n\n"
            "For $24.99 a month, you get a clean, verified portfolio link that proves to nearby "
            "homeowners you are the real deal.\n\n"
            "If you have 2 minutes today, you can set your profile up right here: {{signup_link}}\n\n"
            "Best,\n\nVijay\nGK Admin, GigKraft"
        ),
    },
    {
        "name": "Sequence Step 3 — Final Check",
        "channel": "email",
        "kind": "sequence_3",
        "is_default": True,
        "subject": "Closing out your pending profile request on GigKraft",
        "body": (
            "Hi {{name}},\n\n"
            "I haven't heard back from you, so I'll assume right now isn't the right time "
            "to expand your local client base or set up your digital portfolio.\n\n"
            "I will go ahead and put your profile invite on hold so we don't crowd your inbox. "
            "If you change your mind down the road and want to build a verified reputation layer "
            "in {{primaryZip}} for $24.99/mo, you can always activate your account here: {{signup_link}}.\n\n"
            "Wishing you the absolute best with your business this quarter!\n\n"
            "Cheers,\n\nVijay\nGK Admin, GigKraft"
        ),
    },
]

CHAT_TEMPLATES = [
    {
        "name": "Chat Step 1",
        "channel": "whatsapp",
        "kind": "sequence_1",
        "is_default": True,
        "subject": "",
        "body": (
            "Hi {{name}}! Noticed your excellent work on {{source}}. I'm Vijay, admin for *GigKraft*—"
            "a local trust network for pros in {{primaryZip}}. We build sovereign digital portfolios "
            "for independent contractors. No lead fees or hidden cuts—just your own verified link to show clients. "
            "It's *$24.99/mo* or *$249.99/yr* flat.\n\n"
            "If you'd like to reserve your profile link, check it out here: {{signup_link}}"
        ),
    },
    {
        "name": "Chat Step 2",
        "channel": "whatsapp",
        "kind": "sequence_2",
        "is_default": True,
        "subject": "",
        "body": (
            "Hey {{name}}, just following up! Local pros are loving *GigKraft* because they fully own "
            "their reviews and portfolio link, bypassing unpredictable platform algorithms. Great for "
            "dropping directly into your WhatsApp groups or Nextdoor replies.\n\n"
            "Set up your verified local profile in 2 mins: {{signup_link}}"
        ),
    },
    {
        "name": "Chat Step 3",
        "channel": "whatsapp",
        "kind": "sequence_3",
        "is_default": True,
        "subject": "",
        "body": (
            "Hi {{name}}, closing out your pending invite for now so I don't bug you. "
            "If you ever want to stand out to nearby homeowners with a clean profile for *$24.99/mo*, "
            "you can unlock it anytime here: {{signup_link}}. Wish you all the best!"
        ),
    },
]


def seed_templates(apps, schema_editor):
    MessageTemplate = apps.get_model("comms", "MessageTemplate")
    for tmpl in SEQUENCE_TEMPLATES + CHAT_TEMPLATES:
        if not MessageTemplate.objects.filter(kind=tmpl["kind"], channel=tmpl["channel"]).exists():
            MessageTemplate.objects.create(**tmpl)


class Migration(migrations.Migration):
    dependencies = [
        ("comms", "0002_seed_default_templates"),
        ("vendors", "0005_rename_to_prospect"),
    ]

    operations = [
        # Update FK to point at the renamed model
        migrations.AlterField(
            model_name="outreachlog",
            name="prospect",
            field=models.ForeignKey(
                "vendors.Prospect",
                on_delete=django.db.models.deletion.CASCADE,
                related_name="outreach_logs",
                null=True,
                blank=True,
            ),
        ),
        # Widen kind choices to include sequence steps
        migrations.AlterField(
            model_name="messagetemplate",
            name="kind",
            field=models.CharField(
                max_length=20,
                choices=[
                    ("intro", "Intro"),
                    ("reminder", "Reminder"),
                    ("onboarding", "Onboarding"),
                    ("other", "Other"),
                    ("sequence_1", "Sequence Step 1"),
                    ("sequence_2", "Sequence Step 2"),
                    ("sequence_3", "Sequence Step 3"),
                ],
                default="intro",
            ),
        ),
        migrations.RunPython(seed_templates, migrations.RunPython.noop),
    ]
