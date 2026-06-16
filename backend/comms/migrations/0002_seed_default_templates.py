from django.db import migrations

EMAIL_BODY = """Hi {{contact_person}},

I came across your work and wanted to share something I think you'd find valuable.

GigKraft is a platform built for pros like you — a place to store, showcase, and share your project portfolio without depending on Instagram, Houzz, or any other platform you don't own.

Your own page. Your own projects. No algorithm, no distractions — just your craft.

Here's what a GigKraft profile looks like:
https://gigkraft.com/pros/stephan-carry

Plans:
• $19.99/month or $199.99/year
• Optional: We'll set up your page and add up to 5 projects for just $50 more

Ready to get started? Sign up here:
https://gigkraft.com/register

Questions? Reach out:
• Email: vijaysarkarvedula@gmail.com
• WhatsApp Vijay: (341) 356-1982

Would love to have you on GigKraft!

Vijay
GigKraft"""

WHATSAPP_BODY = """Hi {{contact_person}}! Check out GigKraft — a platform where pros like you can store and share your projects without needing a website or depending on other platforms. No algorithms, just your work.

Sign up at https://gigkraft.com/register (starts at $19.99/mo).

Questions? WhatsApp Vijay at (341) 356-1982 or email vijaysarkarvedula@gmail.com"""


def seed_templates(apps, schema_editor):
    MessageTemplate = apps.get_model("comms", "MessageTemplate")
    MessageTemplate.objects.get_or_create(
        name="GigKraft Intro — Email",
        defaults={
            "channel": "email",
            "kind": "intro",
            "subject": "Your work deserves its own space — GigKraft",
            "body": EMAIL_BODY,
            "is_default": True,
        },
    )
    MessageTemplate.objects.get_or_create(
        name="GigKraft Intro — WhatsApp",
        defaults={
            "channel": "whatsapp",
            "kind": "intro",
            "subject": "",
            "body": WHATSAPP_BODY,
            "is_default": True,
        },
    )


def unseed_templates(apps, schema_editor):
    MessageTemplate = apps.get_model("comms", "MessageTemplate")
    MessageTemplate.objects.filter(name__in=[
        "GigKraft Intro — Email",
        "GigKraft Intro — WhatsApp",
    ]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("comms", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_templates, reverse_code=unseed_templates),
    ]
