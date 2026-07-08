"""
One-off backfill: insert {{example_link}} into MessageTemplate bodies that
were created/edited before that variable existed, so existing WhatsApp/SMS
and email outreach templates start including the tracked example-profile
link alongside {{signup_link}} without losing any hand-customized wording.

Run once per environment:
  python manage.py add_example_link_to_templates --dry-run   # preview
  python manage.py add_example_link_to_templates              # apply
"""
from django.core.management.base import BaseCommand

from comms.models import MessageTemplate

EXAMPLE_PARAGRAPH = "See a live example profile here: {{example_link}}"


class Command(BaseCommand):
    help = "Insert {{example_link}} into existing templates that only have {{signup_link}}."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would change without saving.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        candidates = MessageTemplate.objects.filter(body__contains="{{signup_link}}").exclude(
            body__contains="{{example_link}}"
        )

        if not candidates:
            self.stdout.write(self.style.SUCCESS("Nothing to do — every template already has {{example_link}}."))
            return

        for tmpl in candidates:
            paragraphs = tmpl.body.split("\n\n")
            signup_at = next(
                (i for i, p in enumerate(paragraphs) if "{{signup_link}}" in p),
                len(paragraphs) - 1,
            )
            # Insert before the signup-link paragraph, unless it's the very
            # first (or only) paragraph — then append after it instead, so a
            # single-paragraph template doesn't get the example link shoved
            # in front of its greeting.
            insert_at = signup_at if signup_at > 0 else signup_at + 1
            paragraphs.insert(insert_at, EXAMPLE_PARAGRAPH)
            new_body = "\n\n".join(paragraphs)

            self.stdout.write(f"--- [{tmpl.channel}] {tmpl.name} (id={tmpl.id}) ---")
            self.stdout.write(self.style.WARNING("BEFORE:"))
            self.stdout.write(tmpl.body)
            self.stdout.write(self.style.SUCCESS("AFTER:"))
            self.stdout.write(new_body)
            self.stdout.write("")

            if not dry_run:
                tmpl.body = new_body
                tmpl.save(update_fields=["body", "updated_at"])

        verb = "Would update" if dry_run else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{verb} {candidates.count()} template(s)."))
