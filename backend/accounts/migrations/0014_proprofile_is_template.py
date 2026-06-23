from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0013_add_visitor_role"),
    ]

    operations = [
        migrations.AddField(
            model_name="proprofile",
            name="is_template",
            field=models.BooleanField(default=False),
        ),
    ]
