"""Export the OpenAPI schema to JSON for typed client generation.

Usage:
    python manage.py export_openapi
    python manage.py export_openapi --output ../frontend/openapi.json

Frontend/mobile can then generate typed clients, e.g.:
    npx openapi-typescript openapi/openapi.json -o src/types/api.d.ts
"""
import json
from pathlib import Path

from django.core.management.base import BaseCommand

from config.api import api


class Command(BaseCommand):
    help = "Write the API's OpenAPI schema to a JSON file."

    def add_arguments(self, parser):
        parser.add_argument(
            "--output",
            default="openapi/openapi.json",
            help="Output path (relative to the backend root or absolute).",
        )
        parser.add_argument(
            "--indent", type=int, default=2, help="JSON indentation (default 2)."
        )

    def handle(self, *args, **options):
        schema = api.get_openapi_schema()
        output = Path(options["output"])
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(
            json.dumps(schema, indent=options["indent"]) + "\n", encoding="utf-8"
        )
        self.stdout.write(self.style.SUCCESS(f"OpenAPI schema written to {output}"))
