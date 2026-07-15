"""
One-off backfill: pro invites created before ProInvite.zip existed have no
ZIP on file. Default those to the inviting referrer's own ZIP
(ReferrerProfile.default_zip), matching the new default applied at invite
creation time (see referrals.api.invite_pro).

Run once per environment:
  python manage.py backfill_pro_invite_zip --dry-run   # preview
  python manage.py backfill_pro_invite_zip              # apply
"""
from django.core.management.base import BaseCommand

from referrals.models import ProInvite, ReferrerProfile


class Command(BaseCommand):
    help = "Backfill ProInvite.zip from the inviting referrer's default_zip where blank."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would change without saving.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        candidates = ProInvite.objects.filter(zip="").select_related("invited_by")

        if not candidates:
            self.stdout.write(self.style.SUCCESS("Nothing to do — every invite already has a ZIP."))
            return

        default_zips = dict(
            ReferrerProfile.objects.exclude(default_zip="")
            .values_list("user_id", "default_zip")
        )

        updated = 0
        skipped = 0
        for invite in candidates:
            referrer_zip = default_zips.get(invite.invited_by_id)
            if not referrer_zip:
                skipped += 1
                continue

            self.stdout.write(
                f"ProInvite #{invite.pk} ({invite.name!r}, invited by {invite.invited_by}): "
                f"'' -> {self.style.SUCCESS(referrer_zip)}"
            )
            if not dry_run:
                invite.zip = referrer_zip
                invite.save(update_fields=["zip"])
            updated += 1

        verb = "Would update" if dry_run else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{verb} {updated} invite(s); skipped {skipped} (referrer has no ZIP either)."))
