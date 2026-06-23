from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0014_proprofile_is_template"),
    ]

    operations = [
        migrations.AddField(
            model_name="proprofile",
            name="trade_categories",
            field=models.JSONField(default=list, blank=True),
        ),
    ]
