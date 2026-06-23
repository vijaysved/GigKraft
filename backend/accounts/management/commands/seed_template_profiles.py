"""Idempotent command to seed the two marketing template profiles.

Run once after deploying migration 0014. Safe to re-run — existing
template profiles are updated in place, not duplicated.

  python manage.py seed_template_profiles
"""
from django.core.management.base import BaseCommand
from django.db import transaction


MEMBER_HANDLE = "template-member"
PRO_HANDLE = "template-pro"

MEMBER_EMAIL = "template-member@gigkraft.internal"
PRO_EMAIL = "template-pro@gigkraft.internal"


class Command(BaseCommand):
    help = "Seed the template-member and template-pro demo profiles."

    def handle(self, *args, **options):
        from accounts.models import ProProfile, User

        with transaction.atomic():
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
                f"Template member profile: /pros/{member_pro.handle} (pk={member_pro.pk})"
            ))

            pro_pro = self._upsert_profile(
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
                    "wallpaper_id": 3,
                    "wallpaper_url": "",
                    "avatar_url": "",
                    "is_verified": True,
                },
            )
            self.stdout.write(self.style.SUCCESS(
                f"Template pro profile:    /pros/{pro_pro.handle} (pk={pro_pro.pk})"
            ))

        self.stdout.write(self.style.SUCCESS("Done. Update SiteSettings URLs via /gk-admin/site-config."))

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
            defaults={
                "handle": handle,
                "is_template": True,
                **data,
            },
        )
        return profile
