from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='lead',
            name='thread_type',
            field=models.CharField(
                choices=[('lead', 'Lead / Quote'), ('chat', 'Chat'), ('request', 'Request')],
                default='lead',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='lead',
            name='request_accepted',
            field=models.BooleanField(default=False),
        ),
    ]
