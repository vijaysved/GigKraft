"""
Add html_body field to MessageTemplate.
Seed branded HTML email bodies for all default prospect and trade school templates.
"""
from django.db import migrations, models

GK_SITE = "https://www.gigkraft.com"
GK_EXAMPLE = "https://www.gigkraft.com/pros/template-pro"
GK_DARK = "#111827"
GK_GREEN = "#34d399"
GK_BODY_GREEN = "#059669"


def _shell(body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.10);">
  <div style="background:{GK_DARK};padding:20px 32px;">
    <a href="{GK_SITE}" style="text-decoration:none;">
      <span style="color:{GK_GREEN};font-size:20px;font-weight:700;letter-spacing:-0.3px;">GigKraft</span>
    </a>
  </div>
  <div style="padding:32px;color:#374151;font-size:15px;line-height:1.75;">
    {body_html}
  </div>
  <div style="border-top:1px solid #e5e7eb;padding:16px 32px;background:#f9fafb;">
    <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
      <a href="{GK_SITE}" style="color:#9ca3af;text-decoration:none;">www.gigkraft.com</a>
      &nbsp;&middot;&nbsp;vijay@gigkraft.com
    </p>
  </div>
</div>
</body>
</html>"""


def _example_card(caption: str = "See what a GigKraft profile looks like:") -> str:
    return f"""<div style="background:#f0fdf4;border-left:3px solid {GK_GREEN};border-radius:4px;padding:14px 18px;margin:24px 0;">
  <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">{caption}</p>
  <a href="{GK_EXAMPLE}" style="color:{GK_BODY_GREEN};font-weight:600;font-size:14px;">gigkraft.com/pros/template-pro</a>
</div>"""


def _cta(label: str, href: str = "{{signup_link}}") -> str:
    return f"""<div style="text-align:center;margin:28px 0;">
  <a href="{href}" style="display:inline-block;background:{GK_GREEN};color:#064e3b;padding:13px 30px;border-radius:6px;font-weight:700;font-size:14px;text-decoration:none;">{label}</a>
</div>"""


def _sig(name: str = "Vijay", role: str = "GK Admin") -> str:
    return (
        f'<p>Best regards,<br><strong>{name}</strong><br>'
        f'{role}, <a href="{GK_SITE}" style="color:{GK_BODY_GREEN};">GigKraft</a></p>'
    )


# ── Individual template HTML bodies ──────────────────────────────────────────

INTRO_HTML = _shell(f"""
<p>Hi {{{{contact_person}}}},</p>
<p>I came across your work and wanted to share something I think you'd find valuable.</p>
<p><a href="{GK_SITE}" style="color:{GK_BODY_GREEN};font-weight:600;">GigKraft</a> is a platform built for pros like you — a place to store, showcase, and share your project portfolio without depending on Instagram, Houzz, or any other platform you don't own.</p>
<p>Your own page. Your own projects. No algorithm, no distractions — just your craft.</p>
{_example_card()}
<p><strong>Plans:</strong><br>
&bull; $19.99/month or $199.99/year<br>
&bull; Optional: We'll set up your page and add up to 5 projects for just $50 more</p>
{_cta("Get Started on GigKraft &rarr;", "https://gigkraft.com/register")}
<p style="font-size:13px;color:#6b7280;">Questions?<br>
&bull; Email: vijaysarkarvedula@gmail.com<br>
&bull; WhatsApp Vijay: (341) 356-1982</p>
<p>Would love to have you on GigKraft!</p>
<p>Vijay<br><a href="{GK_SITE}" style="color:{GK_BODY_GREEN};">GigKraft</a></p>
""")

SEQ1_HTML = _shell(f"""
<p>Hi {{{{name}}}},</p>
<p>I came across your services on <strong>{{{{source}}}}</strong> and wanted to reach out. I'm Vijay, one of the admins at <a href="{GK_SITE}" style="color:{GK_BODY_GREEN};font-weight:600;">GigKraft</a> — a local community platform built specifically for trusted, independent pros in the <strong>{{{{primaryZip}}}}</strong> area.</p>
<p>Unlike traditional bidding networks that eat into your margins or charge you for fake leads, GigKraft acts as your <strong>sovereign digital portfolio</strong>. It's an independent reference layer where you own your local reputation, showcase past projects, and let homeowners verify your work directly.</p>
{_example_card()}
<p>We keep things simple: <strong>$24.99/month</strong> or <strong>$249.99/year</strong>. No hidden fees. No payment for leads.</p>
{_cta("Claim Your Profile &rarr;")}
{_sig()}
""")

SEQ2_HTML = _shell(f"""
<p>Hi {{{{name}}}},</p>
<p>Just following up on my note from a few days ago.</p>
<p>A lot of local pros tell us they're tired of corporate platforms shifting algorithms or hiding their best client reviews behind expensive paywalls. With <a href="{GK_SITE}" style="color:{GK_BODY_GREEN};font-weight:600;">GigKraft</a>, your profile is yours to keep and share anywhere — whether you're talking to clients on WhatsApp, Nextdoor, or Craigslist.</p>
{_example_card()}
<p>For <strong>$24.99 a month</strong>, you get a clean, verified portfolio link that proves to nearby homeowners you are the real deal.</p>
{_cta("Set Up Your Profile &rarr;")}
{_sig()}
""")

SEQ3_HTML = _shell(f"""
<p>Hi {{{{name}}}},</p>
<p>I haven't heard back from you, so I'll assume right now isn't the right time to expand your local client base or set up your digital portfolio.</p>
<p>I'll go ahead and put your profile invite on hold so we don't crowd your inbox. If you change your mind, you can always build a verified reputation layer in <strong>{{{{primaryZip}}}}</strong> for $24.99/mo.</p>
{_example_card("Your future GigKraft profile could look like this:")}
{_cta("Activate Anytime &rarr;")}
<p>Wishing you the absolute best with your business this quarter!</p>
<p>Cheers,<br><strong>Vijay</strong><br>GK Admin, <a href="{GK_SITE}" style="color:{GK_BODY_GREEN};">GigKraft</a></p>
""")

TS1_HTML = _shell(f"""
<p>Hi,</p>
<p>My name is Vijay Vedula, co-founder of <a href="{GK_SITE}" style="color:{GK_BODY_GREEN};font-weight:600;">GigKraft.com</a> — a professional portfolio and trust network built specifically for skilled tradespeople.</p>
<p>I wanted to reach out because your graduates are exactly the kind of workers GigKraft was designed for. When students complete their program, they enter the workforce with real skills — but often no way to prove it digitally. No portfolio, no verified work history, no professional presence beyond a paper certificate.</p>
<p><strong>GigKraft gives them that.</strong> It's a mobile-ready profile where trade professionals can:</p>
<ul style="padding-left:20px;color:#374151;margin:8px 0 16px;">
  <li>Upload before/after photos of completed work from day one</li>
  <li>Store verified credentials and certifications</li>
  <li>Build a portable reputation they own forever &mdash; regardless of employer</li>
</ul>
{_example_card("See what a graduate's GigKraft profile looks like:")}
<p>What I'm proposing: A partnership where GigKraft is offered to your graduating cohort at a discounted rate as a professional career tool. We handle setup — they get a professional profile that follows them throughout their career.</p>
<p>We work with trade programs on preferred pricing — happy to walk you through what that looks like.</p>
<p>Would you have 20 minutes this week or next to explore if this is a fit?</p>
<p>Best,<br><strong>Vijay Vedula</strong><br>Co-Founder, <a href="{GK_SITE}" style="color:{GK_BODY_GREEN};">GigKraft.com</a><br>vijay@gigkraft.com</p>
""")

TS2_HTML = _shell(f"""
<p>Hi,</p>
<p>Just circling back on my note from last week.</p>
<p>One thing worth sharing: the U.S. is projected to face a shortage of <strong>2.1 million skilled trade workers by 2030</strong>. The graduates coming out of programs like yours are increasingly in demand — but competing for the best jobs and clients requires more than a resume.</p>
<p><a href="{GK_SITE}" style="color:{GK_BODY_GREEN};font-weight:600;">GigKraft</a> is building the professional infrastructure that makes that transition easier.</p>
{_example_card("Here's an example of what a graduate's profile looks like:")}
<p>I'd love to show you how it works in a quick demo. If this week doesn't work, feel free to drop a time that does.</p>
<p>Vijay<br>vijay@gigkraft.com</p>
""")

TS3_HTML = _shell(f"""
<p>Hi,</p>
<p>I'll keep this brief — I know your inbox is busy.</p>
<p>If helping your graduates build a professional digital identity before they enter the workforce is something you'd ever want to explore, I'm here. We offer discounted rates for trade programs and are actively building school partnerships right now.</p>
{_example_card(f'Learn more at <a href="{GK_SITE}" style="color:{GK_BODY_GREEN};">GigKraft.com</a> or see a sample profile:')}
<p>If the timing isn't right, no worries at all — I'll leave the door open.</p>
<p>Best,<br><strong>Vijay</strong><br>vijay@gigkraft.com</p>
""")


def update_html_bodies(apps, schema_editor):
    MessageTemplate = apps.get_model("comms", "MessageTemplate")
    updates = [
        ({"name": "GigKraft Intro — Email"}, INTRO_HTML),
        ({"kind": "sequence_1", "channel": "email", "source": ""}, SEQ1_HTML),
        ({"kind": "sequence_2", "channel": "email", "source": ""}, SEQ2_HTML),
        ({"kind": "sequence_3", "channel": "email", "source": ""}, SEQ3_HTML),
        ({"kind": "sequence_1", "channel": "email", "source": "trade_school"}, TS1_HTML),
        ({"kind": "sequence_2", "channel": "email", "source": "trade_school"}, TS2_HTML),
        ({"kind": "sequence_3", "channel": "email", "source": "trade_school"}, TS3_HTML),
    ]
    for filters, html_body in updates:
        MessageTemplate.objects.filter(**filters).update(html_body=html_body)


class Migration(migrations.Migration):

    dependencies = [
        ("comms", "0006_add_source_to_template_and_seed_trade_school"),
    ]

    operations = [
        migrations.AddField(
            model_name="messagetemplate",
            name="html_body",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.RunPython(update_html_bodies, migrations.RunPython.noop),
    ]
