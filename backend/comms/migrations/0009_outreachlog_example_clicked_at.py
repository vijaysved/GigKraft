"""
Add example_clicked_at to OutreachLog.
Data-migrate existing template html_body fields to replace the hardcoded
example-profile URL with the {{example_link}} tracking variable.
"""
from django.db import migrations, models

GK_EXAMPLE = "https://www.gigkraft.com/pros/template-pro"


def replace_example_urls(apps, schema_editor):
    MessageTemplate = apps.get_model("comms", "MessageTemplate")
    for tmpl in MessageTemplate.objects.exclude(html_body=""):
        if GK_EXAMPLE in tmpl.html_body:
            tmpl.html_body = tmpl.html_body.replace(GK_EXAMPLE, "{{example_link}}")
            tmpl.save(update_fields=["html_body"])


class Migration(migrations.Migration):

    dependencies = [
        ("comms", "0008_outreachlog_html_body_sent"),
    ]

    operations = [
        migrations.AddField(
            model_name="outreachlog",
            name="example_clicked_at",
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.RunPython(replace_example_urls, migrations.RunPython.noop),
    ]
