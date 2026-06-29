from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("comms", "0007_messagetemplate_html_body"),
    ]

    operations = [
        migrations.AddField(
            model_name="outreachlog",
            name="html_body_sent",
            field=models.TextField(blank=True, default=""),
        ),
    ]
