from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0007_avatar_url_to_textfield"),
    ]

    operations = [
        migrations.AddField(
            model_name="homeownerprofile",
            name="preferred_trade",
            field=models.CharField(blank=True, default="", max_length=40),
        ),
    ]
