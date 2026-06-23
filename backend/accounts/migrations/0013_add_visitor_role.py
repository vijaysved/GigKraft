from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0012_add_extra_roles'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('visitor', 'Visitor'),
                    ('member', 'Member'),
                    ('pro', 'Pro'),
                    ('homeowner', 'Homeowner'),
                    ('node_manager', 'Node Manager'),
                    ('gk_admin', 'GK Admin'),
                ],
                max_length=20,
            ),
        ),
    ]
