from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vendors', '0006_add_interested_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='prospect',
            name='status',
            field=models.CharField(
                choices=[
                    ('prospect', 'Prospect'),
                    ('interested', 'Interested'),
                    ('in_progress', 'In Progress'),
                    ('converted', 'Converted'),
                    ('on_hold', 'On Hold'),
                    ('abandoned', 'Abandoned'),
                    ('archived', 'Archived'),
                ],
                default='prospect',
                max_length=20,
            ),
        ),
    ]
