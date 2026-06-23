"""Seed trade_categories for existing showcase pros.

Maps each pro's primary_trade to a category + subcategory from the GigKraft taxonomy.
Safe to re-run — only updates pros whose trade_categories list is empty.

  python manage.py seed_trade_categories         # skips already-assigned pros
  python manage.py seed_trade_categories --force  # overwrites all
"""
from django.core.management.base import BaseCommand

from accounts.models import ProProfile

# Canonical category keys used in the UI and gradient map
CAT_REMODELING = "Remodeling & Build"
CAT_MEP        = "Licensed Home Systems"
CAT_INTERIOR   = "Interior Finishes"
CAT_EXTERIOR   = "Exterior & Hardscape"
CAT_MAINTENANCE = "Maintenance & Handyman"

# Maps lowercase primary_trade substrings → (category, subcategory)
TRADE_MAP = [
    ("plumb",      CAT_MEP,        "Plumbing"),
    ("electric",   CAT_MEP,        "Electrical"),
    ("hvac",       CAT_MEP,        "HVAC"),
    ("heat",       CAT_MEP,        "HVAC"),
    ("air cond",   CAT_MEP,        "HVAC"),
    ("pool",       CAT_MEP,        "Pools, Spas & Hot Tubs"),
    ("spa",        CAT_MEP,        "Pools, Spas & Hot Tubs"),
    ("hot tub",    CAT_MEP,        "Pools, Spas & Hot Tubs"),
    ("paint",      CAT_INTERIOR,   "Painting & Staining"),
    ("stain",      CAT_INTERIOR,   "Painting & Staining"),
    ("floor",      CAT_INTERIOR,   "Flooring & Carpet"),
    ("carpet",     CAT_INTERIOR,   "Flooring & Carpet"),
    ("tile",       CAT_INTERIOR,   "Tile & Stone"),
    ("stone",      CAT_INTERIOR,   "Tile & Stone"),
    ("drywall",    CAT_INTERIOR,   "Drywall & Insulation"),
    ("insulation", CAT_INTERIOR,   "Drywall & Insulation"),
    ("cabinet",    CAT_INTERIOR,   "Carpentry & Cabinets"),
    ("carpent",    CAT_INTERIOR,   "Carpentry & Cabinets"),
    ("countertop", CAT_INTERIOR,   "Carpentry & Cabinets"),
    ("roof",       CAT_EXTERIOR,   "Roofing, Siding & Gutters"),
    ("siding",     CAT_EXTERIOR,   "Roofing, Siding & Gutters"),
    ("gutter",     CAT_EXTERIOR,   "Roofing, Siding & Gutters"),
    ("window",     CAT_EXTERIOR,   "Windows & Doors"),
    ("door",       CAT_EXTERIOR,   "Windows & Doors"),
    ("garage",     CAT_EXTERIOR,   "Garages & Openers"),
    ("concrete",   CAT_EXTERIOR,   "Concrete, Brick & Stone"),
    ("brick",      CAT_EXTERIOR,   "Concrete, Brick & Stone"),
    ("patio",      CAT_EXTERIOR,   "Concrete, Brick & Stone"),
    ("driveway",   CAT_EXTERIOR,   "Concrete, Brick & Stone"),
    ("deck",       CAT_EXTERIOR,   "Decks, Porches & Fences"),
    ("porch",      CAT_EXTERIOR,   "Decks, Porches & Fences"),
    ("fence",      CAT_EXTERIOR,   "Decks, Porches & Fences"),
    ("gazebo",     CAT_EXTERIOR,   "Decks, Porches & Fences"),
    ("handyman",   CAT_MAINTENANCE, "Handyman Services"),
    ("kitchen",    CAT_REMODELING, "Kitchen / Bathroom"),
    ("bathroom",   CAT_REMODELING, "Kitchen / Bathroom"),
    ("remodel",    CAT_REMODELING, "Additions & Remodels"),
    ("addition",   CAT_REMODELING, "Additions & Remodels"),
    ("general con",CAT_REMODELING, "Additions & Remodels"),
    ("architect",  CAT_REMODELING, "Architects & Designers"),
    ("design",     CAT_REMODELING, "Architects & Designers"),
    ("builder",    CAT_REMODELING, "Builders (New Homes)"),
    ("foundation", CAT_REMODELING, "Foundations"),
    ("general",    CAT_MAINTENANCE, "Handyman Services"),
    ("repair",     CAT_MAINTENANCE, "Handyman Services"),
    ("lawn",       CAT_MAINTENANCE, "Lawn, Trees & Shrubs"),
    ("landscap",   CAT_MAINTENANCE, "Lawn, Trees & Shrubs"),
    ("tree",       CAT_MAINTENANCE, "Lawn, Trees & Shrubs"),
    ("shrub",      CAT_MAINTENANCE, "Lawn, Trees & Shrubs"),
    ("clean",      CAT_MAINTENANCE, "Cleaning Services"),
    ("maid",       CAT_MAINTENANCE, "Cleaning Services"),
]


def _resolve(primary_trade: str):
    t = primary_trade.lower()
    for keyword, category, subcategory in TRADE_MAP:
        if keyword in t:
            return category, subcategory
    return CAT_MAINTENANCE, "Handyman Services"


class Command(BaseCommand):
    help = "Seed trade_categories for existing showcase pros."

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", help="Overwrite existing assignments.")

    def handle(self, *args, **options):
        force = options["force"]
        updated = 0
        skipped = 0

        for pro in ProProfile.objects.select_related("user").all():
            if pro.trade_categories and not force:
                skipped += 1
                continue

            category, subcategory = _resolve(pro.primary_trade)
            pro.trade_categories = [{"category": category, "subcategories": [subcategory]}]
            pro.save(update_fields=["trade_categories"])
            self.stdout.write(
                self.style.SUCCESS(
                    f"  {pro.display_name} ({pro.primary_trade!r}) -> {category} / {subcategory}"
                )
            )
            updated += 1

        self.stdout.write(self.style.SUCCESS(f"\nDone. Updated: {updated}, Skipped: {skipped}"))
