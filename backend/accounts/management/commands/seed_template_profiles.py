"""Idempotent command to seed the two marketing template profiles.

Run once after deploying migration 0014. Safe to re-run — existing
template profiles are updated in place, krafts and recs are replaced.

  python manage.py seed_template_profiles
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

MEMBER_HANDLE = "template-member"
PRO_HANDLE    = "template-pro"

MEMBER_EMAIL = "template-member@gigkraft.internal"
PRO_EMAIL    = "template-pro@gigkraft.internal"

# Stable Unsplash images — all free-to-use
AVATAR_URL   = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces&auto=format"
WALLPAPER_URL = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1400&h=500&fit=crop&auto=format"

KRAFTS = [
    {
        "title": "Master Bathroom Full Remodel",
        "description": (
            "Complete gut and rebuild of a 1970s master bath. Replaced all supply and drain "
            "lines, installed new fixtures and a tiled walk-in shower from scratch. "
            "Coordinated with the tile sub, pulled the permit, and city inspection signed off first try."
        ),
        "skill": "Bathroom Plumbing",
        "gig_type": "2000_plus",
        "location": "Austin, TX 78701",
        "start_month": 2, "start_year": 2024,
        "end_month": 3,   "end_year": 2024,
        "before_url": "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop&auto=format",
        "after_url":  "https://images.unsplash.com/photo-1552177816-d7c7fb6dbdc2?w=800&h=600&fit=crop&auto=format",
    },
    {
        "title": "Tankless Water Heater Swap",
        "description": (
            "Removed a 40-gal tank unit past its service life, ran a new dedicated gas line, "
            "and installed a Rinnai RU199iN tankless system. Included permit pull and final "
            "city inspection. Homeowner now has unlimited hot water and cut their gas bill by ~30%."
        ),
        "skill": "Water Heater Installation",
        "gig_type": "500_2000",
        "location": "Austin, TX 78702",
        "start_month": 11, "start_year": 2023,
        "end_month": 11,   "end_year": 2023,
        "before_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format",
        "after_url":  "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&h=600&fit=crop&auto=format",
    },
    {
        "title": "Kitchen Drain & Supply Repipe",
        "description": (
            "Replaced galvanized supply lines with PEX throughout the kitchen. Resolved a "
            "chronic slow leak under the sink that had damaged the cabinet floor. Accessed "
            "entirely through the cabinet — no drywall cut, no mess."
        ),
        "skill": "Pipe Replacement",
        "gig_type": "500_2000",
        "location": "Round Rock, TX 78664",
        "start_month": 8, "start_year": 2024,
        "end_month": 8,   "end_year": 2024,
        "before_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop&auto=format",
        "after_url":  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop&auto=format",
    },
]

RECOMMENDATIONS = [
    {
        "client_name": "Sarah K.",
        "stars": 5,
        "channel": "sms",
        "text": (
            "Jordan showed up same-day for an emergency — our main line had backed up completely. "
            "Fixed in under 3 hours, cleaned up perfectly. Couldn't recommend more highly."
        ),
    },
    {
        "client_name": "Marcus T.",
        "stars": 5,
        "channel": "email",
        "text": (
            "Had Jordan repipe our entire kitchen after a slow leak destroyed the cabinet floor. "
            "Honest quote, zero upsell, finished in one day. Genuinely solid pro."
        ),
    },
    {
        "client_name": "Linda R.",
        "stars": 5,
        "channel": "whatsapp",
        "text": (
            "Master bath remodel came out exactly as planned. Jordan coordinated with the tile "
            "guy, pulled the permit himself, and the city signed off first try. Highly recommend."
        ),
    },
]


class Command(BaseCommand):
    help = "Seed the template-member and template-pro demo profiles."

    def handle(self, *args, **options):
        from accounts.models import ProProfile, User

        with transaction.atomic():
            # ── Member ──────────────────────────────────────────────────────────
            member_pro = self._upsert_profile(
                email=MEMBER_EMAIL,
                first_name="Alex",
                last_name="Morgan",
                handle=MEMBER_HANDLE,
                role=User.Role.MEMBER,
                data={
                    "business_name": "Alex Morgan Home Services",
                    "primary_trade": "General Handyman",
                    "skill_tags": ["Drywall", "Painting", "Furniture Assembly"],
                    "bio": (
                        "I'm a local handyman offering reliable help around the house. "
                        "Available on weekends and evenings. Just getting started on gigKraft."
                    ),
                    "base_zip": "78701",
                    "service_mode": ProProfile.ServiceMode.EXPLICIT,
                    "service_zips": ["78701", "78702"],
                    "response_hours": 24,
                    "licensed": False,
                    "insured": False,
                    "availability": ProProfile.Availability.PART,
                    "wallpaper_id": 0,
                    "wallpaper_url": "",
                    "avatar_url": "",
                    "is_verified": False,
                },
            )
            self.stdout.write(self.style.SUCCESS(
                f"Template member: /pros/{member_pro.handle} (pk={member_pro.pk})"
            ))

            # ── Pro ─────────────────────────────────────────────────────────────
            pro_profile = self._upsert_profile(
                email=PRO_EMAIL,
                first_name="Jordan",
                last_name="Rivera",
                handle=PRO_HANDLE,
                role=User.Role.PRO,
                data={
                    "business_name": "Rivera Plumbing & HVAC",
                    "primary_trade": "Plumbing",
                    "skill_tags": [
                        "Leak Repair", "Water Heater Installation", "Drain Cleaning",
                        "HVAC Maintenance", "Pipe Replacement", "Emergency Callouts",
                        "Bathroom Remodel", "Fixture Installation",
                    ],
                    "bio": (
                        "Licensed master plumber with 12 years experience across residential and "
                        "light commercial work. Every job is documented, every customer endorsed. "
                        "Available same-day for emergencies in the Austin metro area."
                    ),
                    "base_zip": "78701",
                    "service_mode": ProProfile.ServiceMode.RADIAL,
                    "service_center_zip": "78701",
                    "service_radius_miles": 30,
                    "service_zips": [],
                    "response_hours": 2,
                    "licensed": True,
                    "license_number": "TX-PL-884721",
                    "insured": True,
                    "availability": ProProfile.Availability.FULL,
                    "wallpaper_id": 0,
                    "wallpaper_url": WALLPAPER_URL,
                    "avatar_url": AVATAR_URL,
                    "is_verified": True,
                },
            )
            self.stdout.write(self.style.SUCCESS(
                f"Template pro:    /pros/{pro_profile.handle} (pk={pro_profile.pk})"
            ))

            # ── Krafts ──────────────────────────────────────────────────────────
            self._seed_krafts(pro_profile)

            # ── Recommendations ─────────────────────────────────────────────────
            self._seed_recommendations(pro_profile)

        self.stdout.write(self.style.SUCCESS(
            "Done. Update SiteSettings URLs via /gk-admin/site-config."
        ))

    # ── helpers ────────────────────────────────────────────────────────────────

    def _upsert_profile(self, email, first_name, last_name, handle, role, data):
        from accounts.models import ProProfile, User

        user, _ = User.objects.update_or_create(
            email=email,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "role": role,
                "is_active": True,
            },
        )
        if not user.has_usable_password():
            user.set_unusable_password()
            user.save(update_fields=["password"])

        profile, _ = ProProfile.objects.update_or_create(
            user=user,
            defaults={"handle": handle, "is_template": True, **data},
        )
        return profile

    def _seed_krafts(self, pro):
        from krafts.models import Kraft, KraftPhoto
        from nodes.models import Node

        node = pro.user.node or Node.objects.filter(is_active=True).first()
        if node is None:
            self.stdout.write(self.style.WARNING(
                "No active node found — skipping Krafts. Create a node first."
            ))
            return

        # Clear existing template Krafts so re-runs stay clean
        pro.krafts.all().delete()

        for k in KRAFTS:
            kraft = Kraft.objects.create(
                pro=pro,
                node=node,
                title=k["title"],
                description=k["description"],
                skill=k["skill"],
                gig_type=k["gig_type"],
                location=k["location"],
                start_month=k["start_month"],
                start_year=k["start_year"],
                end_month=k["end_month"],
                end_year=k["end_year"],
                status=Kraft.Status.VERIFIED,
            )
            KraftPhoto.objects.create(
                kraft=kraft, kind=KraftPhoto.Kind.BEFORE, image_url=k["before_url"], order=0
            )
            KraftPhoto.objects.create(
                kraft=kraft, kind=KraftPhoto.Kind.AFTER, image_url=k["after_url"], order=0
            )
            self.stdout.write(f"  Kraft: {kraft.title} [{kraft.slug}]")

    def _seed_recommendations(self, pro):
        from recommendations.models import Recommendation

        # Clear existing template recs so re-runs stay clean
        pro.recommendations.all().delete()

        for r in RECOMMENDATIONS:
            Recommendation.objects.create(
                pro=pro,
                client_name=r["client_name"],
                stars=r["stars"],
                channel=r["channel"],
                text=r["text"],
                status=Recommendation.Status.APPROVED,
                submitted_at=timezone.now(),
            )
            self.stdout.write(f"  Rec: {r['client_name']} ({r['stars']} stars)")
