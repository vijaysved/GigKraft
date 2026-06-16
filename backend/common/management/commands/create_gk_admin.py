"""Management command: python manage.py create_gk_admin

Creates (or resets) GigKraft super-admin accounts with role=gk_admin.
Password-based: admin@gigkraft.com  /  GigKraft09!
Google OAuth:   oddlynicellc@gmail.com  (no password needed)
"""
from django.core.management.base import BaseCommand

from accounts.models import User

PASSWORD_ADMINS = [
    ("admin@gigkraft.com", "GigKraft09!", "GigKraft", "Admin"),
]

GOOGLE_ADMINS = [
    ("oddlynicellc@gmail.com", "Oddly", "Nice"),
]


class Command(BaseCommand):
    help = "Create the GigKraft super-admin (gk_admin) accounts."

    def handle(self, *args, **options):
        for email, password, first, last in PASSWORD_ADMINS:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={"role": User.Role.GK_ADMIN, "first_name": first, "last_name": last, "is_staff": True, "is_superuser": True},
            )
            user.set_password(password)
            user.role = User.Role.GK_ADMIN
            user.is_staff = True
            user.is_superuser = True
            user.save()
            action = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"{action} GK admin account: {email}"))

        for email, first, last in GOOGLE_ADMINS:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={"role": User.Role.GK_ADMIN, "first_name": first, "last_name": last},
            )
            user.role = User.Role.GK_ADMIN
            user.save(update_fields=["role"])
            action = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"{action} GK admin account: {email}"))
