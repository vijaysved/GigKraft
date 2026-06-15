from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("krafts", "0002_kraft_new_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name="kraftphoto",
            name="image_url",
            field=models.TextField(),
        ),
    ]
