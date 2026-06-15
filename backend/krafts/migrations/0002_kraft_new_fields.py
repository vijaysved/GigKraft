from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("krafts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="kraft",
            name="skill",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="kraft",
            name="gig_type",
            field=models.CharField(blank=True, default="", max_length=20),
        ),
        migrations.AddField(
            model_name="kraft",
            name="location",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="kraft",
            name="start_month",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="kraft",
            name="start_year",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="kraft",
            name="end_month",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="kraft",
            name="end_year",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="kraft",
            name="description",
            field=models.TextField(blank=True, default="", max_length=512),
        ),
        migrations.AlterField(
            model_name="kraftphoto",
            name="image_url",
            field=models.URLField(max_length=2000),
        ),
    ]
