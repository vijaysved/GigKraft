"""
Management command: seed_data

Creates a minimal but realistic local dataset:
  - 1 Node  (austin-tx)
  - 1 Node Manager
  - 3 Pros  (plumber, electrician, painter)
  - 2 Homeowners
  - 3 Krafts (1 draft, 1 pending, 1 verified)

Safe to re-run — uses get_or_create throughout.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import HomeownerProfile, ProProfile, User
from krafts.models import Kraft, KraftPhoto
from nodes.models import Node


PLACEHOLDER_IMG = "https://placehold.co/800x600/png"


class Command(BaseCommand):
    help = "Seed the database with sample data for local development / testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete all seed objects before re-creating them.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            self._reset()

        node = self._seed_node()
        self._seed_node_manager(node)
        pros = self._seed_pros(node)
        self._seed_homeowners(node)
        self._seed_krafts(pros, node)

        self.stdout.write(self.style.SUCCESS("Seed data applied successfully."))

    # ------------------------------------------------------------------ #
    # Reset                                                                #
    # ------------------------------------------------------------------ #

    def _reset(self):
        emails = [
            "manager@gigkraft.local",
            "manager@test.dev",
            "pro.plumber@gigkraft.local",
            "pro.electrician@gigkraft.local",
            "pro.painter@gigkraft.local",
        ]
        phones = ["+15550000001", "+15550000002"]
        User.objects.filter(email__in=emails).delete()
        User.objects.filter(phone__in=phones).delete()
        Node.objects.filter(node_id="austin-tx").delete()
        self.stdout.write("  Reset: removed existing seed objects.")

    # ------------------------------------------------------------------ #
    # Node                                                                 #
    # ------------------------------------------------------------------ #

    def _seed_node(self):
        node, created = Node.objects.get_or_create(
            node_id="austin-tx",
            defaults=dict(
                name="Austin TX",
                center_zip="78701",
                service_zips=["78701", "78702", "78703", "78704", "78705"],
                radius_miles=30,
                is_active=True,
                auto_blast=True,
                escalation_enabled=True,
                escalation_minutes=15,
                default_sla_hours=4,
            ),
        )
        self._log("Node", node.node_id, created)
        return node

    # ------------------------------------------------------------------ #
    # Node Manager                                                         #
    # ------------------------------------------------------------------ #

    def _seed_node_manager(self, node):
        user, created = User.objects.get_or_create(
            email="manager@test.dev",
            defaults=dict(
                role=User.Role.NODE_MANAGER,
                first_name="Alex",
                last_name="Manager",
                node=node,
                is_staff=True,
            ),
        )
        if created:
            user.set_password("Test1234!")
            user.save()
        if not node.manager:
            node.manager = user
            node.save(update_fields=["manager"])
        self._log("Node Manager", user.email, created)
        return user

    # ------------------------------------------------------------------ #
    # Pros                                                                 #
    # ------------------------------------------------------------------ #

    def _seed_pros(self, node):
        specs = [
            dict(
                email="pro.plumber@gigkraft.local",
                first_name="Sam",
                last_name="Waters",
                business_name="Waters Plumbing",
                primary_trade="plumbing",
                skill_tags=["leak repair", "pipe install", "water heater"],
                bio="10 years fixing Austin's toughest leaks.",
                base_zip="78701",
                service_zips=["78701", "78702", "78703"],
                licensed=True,
                insured=True,
                is_verified=True,
            ),
            dict(
                email="pro.electrician@gigkraft.local",
                first_name="Jordan",
                last_name="Sparks",
                business_name="Sparks Electric",
                primary_trade="electrical",
                skill_tags=["panel upgrade", "EV charger", "lighting"],
                bio="Licensed master electrician, fast response.",
                base_zip="78704",
                service_zips=["78704", "78705"],
                licensed=True,
                insured=True,
                is_verified=True,
            ),
            dict(
                email="pro.painter@gigkraft.local",
                first_name="Casey",
                last_name="Brush",
                business_name="Brush & Roll Painting",
                primary_trade="painting",
                skill_tags=["interior", "exterior", "cabinet refinishing"],
                bio="Transforming Austin homes one room at a time.",
                base_zip="78702",
                service_zips=["78701", "78702", "78703", "78704"],
                licensed=False,
                insured=True,
                is_verified=False,
            ),
        ]
        profiles = []
        for spec in specs:
            email = spec.pop("email")
            first_name = spec.pop("first_name")
            last_name = spec.pop("last_name")
            user, created = User.objects.get_or_create(
                email=email,
                defaults=dict(
                    role=User.Role.PRO,
                    first_name=first_name,
                    last_name=last_name,
                    node=node,
                ),
            )
            if created:
                user.set_password("gigkraft")
                user.save()
            profile, _ = ProProfile.objects.get_or_create(
                user=user,
                defaults=spec,
            )
            self._log("Pro", email, created)
            profiles.append(profile)
        return profiles

    # ------------------------------------------------------------------ #
    # Homeowners                                                           #
    # ------------------------------------------------------------------ #

    def _seed_homeowners(self, node):
        specs = [
            dict(phone="+15550000001", first_name="Taylor", last_name="Home", default_zip="78701"),
            dict(phone="+15550000002", first_name="Morgan", last_name="House", default_zip="78704"),
        ]
        for spec in specs:
            phone = spec["phone"]
            user, created = User.objects.get_or_create(
                phone=phone,
                defaults=dict(
                    role=User.Role.HOMEOWNER,
                    first_name=spec["first_name"],
                    last_name=spec["last_name"],
                    node=node,
                ),
            )
            HomeownerProfile.objects.get_or_create(
                user=user,
                defaults=dict(default_zip=spec["default_zip"], dispatch_opt_in=True),
            )
            self._log("Homeowner", phone, created)

    # ------------------------------------------------------------------ #
    # Krafts                                                               #
    # ------------------------------------------------------------------ #

    def _seed_krafts(self, pros, node):
        plumber, electrician, painter = pros

        # Draft kraft — no photos yet, not publishable
        kraft1, c1 = Kraft.objects.get_or_create(
            pro=plumber,
            title="Bathroom pipe replacement",
            defaults=dict(
                node=node,
                description="Full copper-to-PEX repipe under master bath.",
                status=Kraft.Status.DRAFT,
            ),
        )
        self._log("Kraft (draft)", kraft1.title, c1)

        # Verified kraft — has after photo + confirmed invoice
        kraft2, c2 = Kraft.objects.get_or_create(
            pro=electrician,
            title="200A panel upgrade",
            defaults=dict(
                node=node,
                description="Replaced 100A Federal Pacific panel with 200A Square D.",
                invoice_cost="3200.00",
                invoice_confirmed=True,
                status=Kraft.Status.VERIFIED,
            ),
        )
        if c2:
            KraftPhoto.objects.create(
                kraft=kraft2, kind=KraftPhoto.Kind.BEFORE, image_url=PLACEHOLDER_IMG, order=0
            )
            KraftPhoto.objects.create(
                kraft=kraft2, kind=KraftPhoto.Kind.AFTER, image_url=PLACEHOLDER_IMG, order=0
            )
        self._log("Kraft (verified)", kraft2.title, c2)

        # Pending kraft — has after photo + invoice but awaiting admin review
        kraft3, c3 = Kraft.objects.get_or_create(
            pro=painter,
            title="Full interior repaint — 3BR home",
            defaults=dict(
                node=node,
                description="Sherwin-Williams Emerald, 3 bedrooms + living room.",
                invoice_cost="4800.00",
                invoice_confirmed=True,
                status=Kraft.Status.PENDING,
            ),
        )
        if c3:
            KraftPhoto.objects.create(
                kraft=kraft3, kind=KraftPhoto.Kind.BEFORE, image_url=PLACEHOLDER_IMG, order=0
            )
            KraftPhoto.objects.create(
                kraft=kraft3, kind=KraftPhoto.Kind.AFTER, image_url=PLACEHOLDER_IMG, order=0
            )
        self._log("Kraft (pending)", kraft3.title, c3)

    # ------------------------------------------------------------------ #
    # Helpers                                                              #
    # ------------------------------------------------------------------ #

    def _log(self, kind, label, created):
        verb = "Created" if created else "Already exists"
        style = self.style.SUCCESS if created else self.style.WARNING
        self.stdout.write(style(f"  {verb}: {kind} — {label}"))
