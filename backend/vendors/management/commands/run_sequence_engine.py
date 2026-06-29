"""
Automated email sequence engine.

Run daily (e.g. via Railway cron: `python manage.py run_sequence_engine`).

Step evaluation:
  step=1, last_contacted >= 3 days ago  → send step 2
  step=2, last_contacted >= 4 days ago  → send step 3  (7 days total)
  step=3, last_contacted >= 5 days ago  → auto-abandon (12 days total)

Step 1 is triggered immediately by the start_sequence API endpoint, not this command.
"""
import uuid
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from comms.models import MessageTemplate, OutreachLog
from comms.services import send_email
from vendors.models import Prospect

STEP_DELAYS = {
    1: timedelta(days=3),
    2: timedelta(days=4),
    3: timedelta(days=5),
}


class Command(BaseCommand):
    help = "Advance automated email sequences for IN_PROGRESS prospects."

    def handle(self, *args, **options):
        now = timezone.now()
        qs = Prospect.objects.filter(status=Prospect.Status.IN_PROGRESS)
        advanced = 0
        abandoned = 0
        skipped = 0

        for prospect in qs:
            lca = prospect.last_contacted_at
            step = prospect.current_sequence_step

            if lca is None or step == 0:
                skipped += 1
                continue

            delay = STEP_DELAYS.get(step)
            if delay is None or (now - lca) < delay:
                skipped += 1
                continue

            if step == 3:
                prospect.status = Prospect.Status.ABANDONED
                prospect.save(update_fields=["status", "updated_at"])
                abandoned += 1
                self.stdout.write(f"  Abandoned: {prospect.prospect_id} ({prospect.name})")
                continue

            next_step = step + 1
            self._send_step(prospect, next_step, now)
            advanced += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Sequence engine done — advanced: {advanced}, abandoned: {abandoned}, skipped: {skipped}"
            )
        )

    def _send_step(self, prospect: Prospect, step: int, now) -> None:
        if not prospect.email:
            self.stdout.write(
                self.style.WARNING(f"  No email for {prospect.prospect_id}, advancing step without email.")
            )
            prospect.current_sequence_step = step
            prospect.last_contacted_at = now
            prospect.save(update_fields=["current_sequence_step", "last_contacted_at", "updated_at"])
            return

        template = (
            MessageTemplate.objects
            .filter(kind=f"sequence_{step}", channel="email", is_default=True)
            .first()
        )
        if template is None:
            self.stdout.write(
                self.style.WARNING(f"  No sequence_{step} email template found, skipping {prospect.prospect_id}.")
            )
            return

        track_token = uuid.uuid4()
        link_click_token = uuid.uuid4()
        subject, body, html_body = template.render_all(prospect.template_vars_for_log(link_click_token))

        try:
            resend_id = send_email(
                to=prospect.email, subject=subject, body=body,
                html_body=html_body or None,
                track_token=str(track_token),
            )
            prospect.current_sequence_step = step
            prospect.last_contacted_at = now
            prospect.save(update_fields=["current_sequence_step", "last_contacted_at", "updated_at"])
            OutreachLog.objects.create(
                prospect=prospect,
                template=template,
                channel="email",
                to_address=prospect.email,
                subject_sent=subject,
                body_sent=body,
                html_body_sent=html_body or "",
                resend_id=resend_id,
                sequence_step=step,
                email_track_token=track_token,
                link_click_token=link_click_token,
            )
            self.stdout.write(f"  Step {step} sent: {prospect.prospect_id} → {prospect.email}")
        except Exception as exc:
            self.stdout.write(
                self.style.ERROR(f"  Failed step {step} for {prospect.prospect_id}: {exc}")
            )
