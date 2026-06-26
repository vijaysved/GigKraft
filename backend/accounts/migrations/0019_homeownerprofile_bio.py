from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0018_notificationpref_email_in_app"),
    ]

    operations = [
        migrations.AddField(
            model_name="homeownerprofile",
            name="bio",
            field=models.CharField(blank=True, default="", max_length=300),
        ),
    ]
