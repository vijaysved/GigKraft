from django.db import migrations


class Migration(migrations.Migration):
    """Drop EmailTemplate and VendorCommunication — both moved to the comms app."""

    dependencies = [
        ("vendors", "0002_email_templates_and_communications"),
        ("comms", "0001_initial"),
    ]

    operations = [
        migrations.DeleteModel(name="VendorCommunication"),
        migrations.DeleteModel(name="EmailTemplate"),
    ]
