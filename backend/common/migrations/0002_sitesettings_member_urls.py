from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("common", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitesettings",
            name="template_member_url_local",
            field=models.URLField(
                default="http://localhost:5173/pros/stephan-carry",
                help_text="Template free member profile URL used in local/dev environment.",
                max_length=500,
            ),
        ),
        migrations.AddField(
            model_name="sitesettings",
            name="template_member_url_prod",
            field=models.URLField(
                default="https://www.gigkraft.com/pros/chris-karry",
                help_text="Template free member profile URL used in production.",
                max_length=500,
            ),
        ),
    ]
