"""Data migration: create a Circle for every existing homeowner account."""
from django.db import migrations


def create_circles(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    Circle = apps.get_model("circles", "Circle")
    import re

    for user in User.objects.filter(role="homeowner"):
        if Circle.objects.filter(curator=user).exists():
            continue
        parts = [user.first_name, user.last_name]
        base = "-".join(p for p in parts if p).lower() or "circle"
        base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")[:70]
        slug = base
        suffix = 1
        while Circle.objects.filter(slug=slug).exists():
            slug = f"{base}-{suffix}"
            suffix += 1
        Circle.objects.create(curator=user, slug=slug)


class Migration(migrations.Migration):

    dependencies = [
        ("circles", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_circles, migrations.RunPython.noop),
    ]
