from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("leads", "0004_alter_quoterequest_budget"),
    ]

    operations = [
        migrations.AddField(
            model_name="lead",
            name="is_escrow",
            field=models.BooleanField(
                default=False,
                help_text="True when lead is held pending off-platform pro activation via Circle.",
            ),
        ),
    ]
