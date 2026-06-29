"""
Add source field to MessageTemplate for source-specific email sequences.
Seed 3 Trade School email templates (sequence_1/2/3).
"""
from django.db import migrations, models

TRADE_SCHOOL_TEMPLATES = [
    {
        "name": "Trade School — Step 1",
        "channel": "email",
        "kind": "sequence_1",
        "source": "trade_school",
        "is_default": True,
        "subject": "A professional portfolio tool for your trade program graduates",
        "body": (
            "Hi,\n\n"
            "My name is Vijay Vedula, co-founder of GigKraft.com — a professional portfolio and "
            "trust network built specifically for skilled tradespeople.\n\n"
            "I wanted to reach out because your graduates are exactly the kind of workers GigKraft "
            "was designed for. When students complete their program, they enter the workforce with "
            "real skills — but often no way to prove it digitally. No portfolio, no verified work "
            "history, no professional presence beyond a paper certificate.\n\n"
            "GigKraft gives them that. It's a mobile-ready profile where trade professionals can:\n"
            "- Upload before/after photos of completed work from day one\n"
            "- Store verified credentials and certifications\n"
            "- Build a portable reputation they own forever — regardless of employer\n\n"
            "What I'm proposing: A partnership where GigKraft is offered to your graduating cohort "
            "at a discounted rate as a professional career tool. We handle setup, they get a "
            "professional profile that follows them throughout their career.\n\n"
            "We work with trade programs on preferred pricing — happy to walk you through what "
            "that looks like.\n\n"
            "Would you have 20 minutes this week or next to explore if this is a fit?\n\n"
            "Best,\n"
            "Vijay Vedula\n"
            "Co-Founder, GigKraft.com\n"
            "vijay@gigkraft.com"
        ),
    },
    {
        "name": "Trade School — Step 2",
        "channel": "email",
        "kind": "sequence_2",
        "source": "trade_school",
        "is_default": True,
        "subject": "Re: GigKraft — quick follow-up",
        "body": (
            "Hi,\n\n"
            "Just circling back on my note from last week.\n\n"
            "One thing worth sharing: the U.S. is projected to face a shortage of 2.1 million "
            "skilled trade workers by 2030. The graduates coming out of programs like yours are "
            "increasingly in demand — but competing for the best jobs and clients requires more "
            "than a resume.\n\n"
            "GigKraft is building the professional infrastructure that makes that transition easier. "
            "I'd love to show you how it works in a quick demo.\n\n"
            "If this week doesn't work, feel free to drop a time that does.\n\n"
            "Vijay\n"
            "vijay@gigkraft.com"
        ),
    },
    {
        "name": "Trade School — Step 3",
        "channel": "email",
        "kind": "sequence_3",
        "source": "trade_school",
        "is_default": True,
        "subject": "Last note — GigKraft for your graduates",
        "body": (
            "Hi,\n\n"
            "I'll keep this brief — I know your inbox is busy.\n\n"
            "If helping your graduates build a professional digital identity before they enter the "
            "workforce is something you'd ever want to explore, I'm here. We offer discounted rates "
            "for trade programs and are actively building school partnerships right now.\n\n"
            "If the timing isn't right, no worries at all — I'll leave the door open.\n\n"
            "Best,\n"
            "Vijay\n"
            "vijay@gigkraft.com"
        ),
    },
]


def seed_trade_school_templates(apps, schema_editor):
    MessageTemplate = apps.get_model("comms", "MessageTemplate")
    for tmpl in TRADE_SCHOOL_TEMPLATES:
        if not MessageTemplate.objects.filter(kind=tmpl["kind"], channel=tmpl["channel"], source=tmpl["source"]).exists():
            MessageTemplate.objects.create(**tmpl)


class Migration(migrations.Migration):
    dependencies = [
        ("comms", "0005_outreachlog_per_message_click"),
    ]

    operations = [
        migrations.AddField(
            model_name="messagetemplate",
            name="source",
            field=models.CharField(max_length=32, blank=True, default="", db_index=True),
        ),
        migrations.RunPython(seed_trade_school_templates, migrations.RunPython.noop),
    ]
