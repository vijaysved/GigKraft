"""Backfill slugs for any Kraft rows that still have slug=''."""
import random
import string

from django.db import migrations


def _gen():
    d = random.choices(string.digits,          k=3)
    c = random.choices(string.ascii_lowercase, k=7)
    chars = d + c
    random.shuffle(chars)
    return "".join(chars)


def backfill_slugs(apps, schema_editor):
    Kraft = apps.get_model("krafts", "Kraft")
    for kraft in Kraft.objects.filter(slug=""):
        for _ in range(50):
            s = _gen()
            if not Kraft.objects.filter(slug=s).exists():
                kraft.slug = s
                kraft.save(update_fields=["slug"])
                break


class Migration(migrations.Migration):

    dependencies = [
        ("krafts", "0004_kraft_slug"),
    ]

    operations = [
        migrations.RunPython(backfill_slugs, migrations.RunPython.noop),
    ]
