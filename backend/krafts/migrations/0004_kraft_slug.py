from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("krafts", "0003_kraftphoto_image_url_textfield"),
    ]

    operations = [
        migrations.AddField(
            model_name="kraft",
            name="slug",
            field=models.CharField(blank=True, default="", max_length=10),
        ),
        migrations.AlterField(
            model_name="kraft",
            name="slug",
            field=models.CharField(blank=True, default="", max_length=10, unique=True),
        ),
    ]
