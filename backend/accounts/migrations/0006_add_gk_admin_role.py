from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_add_wallpaper_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('pro', 'Pro'),
                    ('homeowner', 'Homeowner'),
                    ('node_manager', 'Node Manager'),
                    ('gk_admin', 'GK Admin'),
                ],
                max_length=20,
            ),
        ),
    ]
