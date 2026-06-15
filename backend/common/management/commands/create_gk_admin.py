"""Management command: python manage.py create_gk_admin

Creates (or resets) the GigKraft super-admin account with role=gk_admin.
Email: admin@gigkraft.com  /  Password: GigKraft09!
"""
from django.core.management.base import BaseCommand

from accounts.models import User

GK_ADMIN_EMAIL = "admin@gigkraft.com"
GK_ADMIN_PASSWORD = "GigKraft09!"


class Command(BaseCommand):
    help = "Create the GigKraft super-admin (gk_admin) account."

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            email=GK_ADMIN_EMAIL,
            defaults={
                "role": User.Role.GK_ADMIN,
                "first_name": "GigKraft",
                "last_name": "Admin",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        user.set_password(GK_ADMIN_PASSWORD)
        user.role = User.Role.GK_ADMIN
        user.is_staff = True
        user.is_superuser = True
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(
            f"{action} GK admin account: {GK_ADMIN_EMAIL}"
        ))
