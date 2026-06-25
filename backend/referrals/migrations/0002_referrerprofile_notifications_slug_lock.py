from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("referrals", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="referrerprofile",
            name="slug_locked",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="referrerprofile",
            name="notify_email",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="referrerprofile",
            name="notify_sms",
            field=models.BooleanField(default=False),
        ),
    ]
