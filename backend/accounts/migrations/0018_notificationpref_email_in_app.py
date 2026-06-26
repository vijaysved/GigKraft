from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0017_alter_user_role"),
    ]

    operations = [
        migrations.AddField(
            model_name="notificationpref",
            name="email_alerts",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="notificationpref",
            name="in_app_alerts",
            field=models.BooleanField(default=True),
        ),
    ]
