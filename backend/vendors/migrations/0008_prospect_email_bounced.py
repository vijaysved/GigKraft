from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("vendors", "0007_prospect_add_archived_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="prospect",
            name="email_bounced",
            field=models.BooleanField(default=False),
        ),
    ]
