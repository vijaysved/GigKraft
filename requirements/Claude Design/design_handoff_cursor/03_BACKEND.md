# 03 · Backend — Django + Django Ninja + PostgreSQL

API style: **Django Ninja** (FastAPI-flavored, Pydantic schemas, auto OpenAPI at `/api/docs`). Use Django ORM models + migrations as normal; expose them through Ninja routers and `Schema` classes (not DRF). Generate the typed frontend client from the OpenAPI spec.

---

## 1. Apps & responsibilities

| App | Owns |
|---|---|
| `accounts` | `User`, `ProProfile`, `HomeownerProfile`, `SavedPro`, `Address`, `NotificationPref`, auth (phone OTP + Google + email/password) |
| `nodes` | `Node`, `NodeMembership` |
| `krafts` | `Kraft`, `KraftPhoto` — the mandatory-After guardrail |
| `leads` | `Lead`, `Message`, `Quote`, `Invoice` |
| `emergencies` | `EmergencyBroadcast`, `BroadcastDispatch` (Twilio fan-out) |
| `recommendations` | `Recommendation` (magic-link) |
| `billing` | `Subscription`, `BillingInvoice`, `Coupon` (Stripe) |
| `notifications` | `DeviceToken` (FCM push registration) |
| `media` | S3 presigned-upload helpers (no models; see 05) |

---

## 2. Models (sketch)

```python
# accounts/models.py
class User(AbstractUser):
    class Role(models.TextChoices):
        PRO = "pro"; HOMEOWNER = "homeowner"; NODE_MANAGER = "node_manager"
    role = models.CharField(max_length=20, choices=Role.choices)
    phone = models.CharField(max_length=20, unique=True)   # E.164
    phone_verified = models.BooleanField(default=False)
    # email + password are stock AbstractUser fields (email/password auth).
    # Google sign-in via django-allauth or a Ninja /auth/google endpoint that
    # verifies the Google ID token and get_or_creates the user.

class HomeownerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="homeowner")
    node = models.ForeignKey("nodes.Node", on_delete=models.PROTECT, related_name="homeowners")
    avatar_url = models.URLField(blank=True)

class Address(models.Model):                # "Saved addresses" (2.6)
    homeowner = models.ForeignKey(HomeownerProfile, on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField(max_length=40, blank=True)   # Home, Rental…
    line1 = models.CharField(max_length=200)
    zip = models.CharField(max_length=10)
    is_primary = models.BooleanField(default=False)

class SavedPro(models.Model):               # "Saved pros" (2.6)
    homeowner = models.ForeignKey(HomeownerProfile, on_delete=models.CASCADE, related_name="saved_pros")
    pro = models.ForeignKey("accounts.ProProfile", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: unique_together = ("homeowner", "pro")

class NotificationPref(models.Model):        # "Dispatch alerts" toggles (2.6)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="notif_pref")
    sms_alerts = models.BooleanField(default=True)        # pro claims / quote updates
    whatsapp_dispatch = models.BooleanField(default=True) # emergency broadcasts
    weekly_digest = models.BooleanField(default=False)    # new verified Krafts in node

class ProProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="pro")
    node = models.ForeignKey("nodes.Node", on_delete=models.PROTECT, related_name="pros")
    primary_trade = models.CharField(max_length=40)         # plumbing, electrical, …
    skill_tags = models.JSONField(default=list)             # ["Leak detection", …]
    bio = models.CharField(max_length=500, blank=True)
    home_zip = models.CharField(max_length=10)
    service_mode = models.CharField(max_length=10, default="explicit")  # explicit|radial
    served_zips = models.JSONField(default=list)            # up to 3 in UI
    service_center_zip = models.CharField(max_length=10, blank=True)
    service_radius_mi = models.PositiveSmallIntegerField(default=15)
    response_hours = models.PositiveSmallIntegerField(default=4)  # SLA promise
    licensed = models.BooleanField(default=False)
    license_number = models.CharField(max_length=60, blank=True)
    insured = models.BooleanField(default=False)
    availability = models.CharField(max_length=10, default="full")     # full|part
    wallpaper_id = models.PositiveSmallIntegerField(default=0)
    avatar_url = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    is_suspended = models.BooleanField(default=False)

# nodes/models.py
class Node(models.Model):
    node_id = models.SlugField(unique=True)   # "southwest-us-04"
    name = models.CharField(max_length=120)
    manager = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name="managed_nodes")
    auto_blast = models.BooleanField(default=True)
    escalation_minutes = models.PositiveSmallIntegerField(default=15)
    default_sla_hours = models.PositiveSmallIntegerField(default=4)

# krafts/models.py
class Kraft(models.Model):
    class Status(models.TextChoices):
        DRAFT="draft"; PENDING="pending"; VERIFIED="verified"; REJECTED="rejected"
    pro = models.ForeignKey(ProProfile, on_delete=models.CASCADE, related_name="krafts")
    node = models.ForeignKey(Node, on_delete=models.PROTECT, related_name="krafts")
    title = models.CharField(max_length=100)
    description = models.TextField(max_length=1000, blank=True)
    invoice_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    invoice_confirmed = models.BooleanField(default=False)
    status = models.CharField(max_length=10, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def has_after(self):
        return self.photos.filter(kind="after").exists()

    def clean(self):
        # ── CORE GUARDRAIL ──
        if self.status in ("pending", "verified"):
            if not self.has_after:
                raise ValidationError("A Kraft requires at least one 'After' photo.")
            if not (self.invoice_cost and self.invoice_confirmed):
                raise ValidationError("A Kraft requires a confirmed invoice cost.")

class KraftPhoto(models.Model):
    kraft = models.ForeignKey(Kraft, on_delete=models.CASCADE, related_name="photos")
    kind = models.CharField(max_length=6, choices=[("before","before"),("after","after")])
    image_url = models.URLField()
    order = models.PositiveSmallIntegerField(default=0)

# leads/models.py
class Lead(models.Model):
    class Status(models.TextChoices):
        ACTIVE="active"; SCHEDULED="scheduled"; QUOTED="quoted"; WON="won"; LOST="lost"; ARCHIVED="archived"
    node = models.ForeignKey(Node, on_delete=models.PROTECT, related_name="leads")
    homeowner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="leads")
    pro = models.ForeignKey(ProProfile, null=True, blank=True, on_delete=models.SET_NULL, related_name="leads")
    job_title = models.CharField(max_length=120)
    detail = models.TextField(blank=True)
    distance_mi = models.DecimalField(max_digits=4, decimal_places=1, null=True)
    status = models.CharField(max_length=10, default=Status.ACTIVE)
    respond_by = models.DateTimeField(null=True)   # created_at + pro.response_hours
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Quote(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="quotes")
    line_items = models.JSONField(default=list)    # [{label, amount}]
    total = models.DecimalField(max_digits=10, decimal_places=2)
    accepted = models.BooleanField(default=False)

# emergencies/models.py
class EmergencyBroadcast(models.Model):
    node = models.ForeignKey(Node, on_delete=models.PROTECT, related_name="broadcasts")
    homeowner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="broadcasts")
    kind = models.CharField(max_length=20)         # burst|power|hvac|lock|other
    description = models.TextField()
    address = models.CharField(max_length=200)
    budget_ceiling = models.DecimalField(max_digits=8, decimal_places=2)
    claimed_by = models.ForeignKey(ProProfile, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

class BroadcastDispatch(models.Model):
    broadcast = models.ForeignKey(EmergencyBroadcast, on_delete=models.CASCADE, related_name="dispatches")
    pro = models.ForeignKey(ProProfile, on_delete=models.CASCADE)
    channel = models.CharField(max_length=10)      # sms|whatsapp
    status = models.CharField(max_length=12, default="notified")  # notified|claimed

# recommendations/models.py
class Recommendation(models.Model):
    pro = models.ForeignKey(ProProfile, on_delete=models.CASCADE, related_name="recommendations")
    lead = models.ForeignKey(Lead, null=True, blank=True, on_delete=models.SET_NULL)
    client_name = models.CharField(max_length=120)
    stars = models.PositiveSmallIntegerField()     # 1..5
    text = models.TextField(blank=True)
    photo_urls = models.JSONField(default=list)
    token = models.CharField(max_length=64, unique=True)   # magic-link
    status = models.CharField(max_length=10, default="pending")  # pending|approved|hidden
    created_at = models.DateTimeField(auto_now_add=True)

# billing/models.py
class Subscription(models.Model):
    pro = models.OneToOneField(ProProfile, on_delete=models.CASCADE, related_name="subscription")
    plan = models.CharField(max_length=10, default="monthly")  # monthly($19.99)|annual($199)
    status = models.CharField(max_length=10, default="active")
    renews_at = models.DateField(null=True)
    card_last4 = models.CharField(max_length=4, blank=True)
    stripe_customer_id = models.CharField(max_length=40, blank=True)
    stripe_subscription_id = models.CharField(max_length=40, blank=True)

# notifications/models.py
class DeviceToken(models.Model):             # FCM push registration
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="device_tokens")
    token = models.CharField(max_length=255, unique=True)
    platform = models.CharField(max_length=10)   # ios|android
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 3. Business rules (enforce server-side)

1. **Mandatory After + confirmed invoice** to publish/verify a Kraft (`Kraft.clean()` above; also check in the publish + admin-verify endpoints). This is the product's core guardrail — never bypass it.
2. **Node scoping.** Every list endpoint filters by `node_id`. Discovery ranks pros by proximity (home ZIP vs. served ZIPs / radius).
3. **Response SLA.** On lead create, set `respond_by = now + pro.response_hours`. Surface countdown to the pro; roll up per-node SLA compliance for admin 3.1.
4. **Emergency dispatch.** On broadcast create, if `node.auto_blast`, fan out `BroadcastDispatch` rows over SMS (Twilio) + WhatsApp (Business API) to eligible pros (matching trade + in-range). First `claim` sets `claimed_by` and opens a `Lead` + chat. Escalate to admin triage (3.2) if unclaimed past `node.escalation_minutes`.
5. **Magic-link recommendations.** Generate a signed `token`; the review screen (2.5) needs no auth. Pro moderates (1.8) before `status=approved` makes it public.
6. **Reputation = proof**, never free text: aggregate approved recommendations + verified Krafts + confirmed invoices. Do not add a free-form "rating" a pro can self-set.

---

## 4. Django Ninja — router sketch

```python
# api/krafts.py
from ninja import Router, Schema
router = Router(tags=["krafts"])

class KraftPhotoIn(Schema): kind: str; image_url: str; order: int = 0
class KraftIn(Schema):
    title: str; description: str = ""; invoice_cost: float | None = None
    invoice_confirmed: bool = False; photos: list[KraftPhotoIn] = []
class KraftOut(Schema):
    id: int; title: str; status: str; invoice_cost: float | None
    has_after: bool; photos: list[KraftPhotoIn]

@router.post("/krafts/{kraft_id}/publish", response=KraftOut)
def publish_kraft(request, kraft_id: int):
    kraft = get_object_or_404(Kraft, id=kraft_id, pro__user=request.auth)
    kraft.status = Kraft.Status.PENDING
    kraft.full_clean()   # raises if no After / unconfirmed invoice
    kraft.save()
    return kraft
```

Suggested endpoints (non-exhaustive):
```
POST   /api/auth/register             /api/auth/login          # email + password
POST   /api/auth/otp/request          /api/auth/otp/verify     # phone OTP (Twilio)
POST   /api/auth/google                                        # verify Google ID token
GET    /api/me
POST   /api/pros                    PATCH /api/pros/me          # onboarding 1.2–1.5
GET    /api/pros?node=&trade=&zip=  GET   /api/pros/{id}        # discovery 2.1/2.2
POST   /api/krafts                  POST  /api/krafts/{id}/publish
GET    /api/krafts?status=pending   POST  /api/krafts/{id}/verify  POST .../reject  # admin 3.5
GET    /api/leads?status=           POST  /api/leads/{id}/messages   POST .../quotes
POST   /api/emergencies             POST  /api/emergencies/{id}/claim   # 2.3
GET    /api/recommendations?status= POST  /api/recommendations  POST .../{id}/approve  # 1.8/2.5
# Homeowner account hub (2.6):
GET    /api/home/account                                        # profile + stat counts
GET    /api/home/saved-pros         POST/DELETE /api/home/saved-pros/{pro_id}
GET    /api/home/jobs                                           # past jobs (leads/quotes won)
GET    /api/home/addresses          POST/PATCH/DELETE /api/home/addresses/{id}
GET    /api/me/notif-prefs          PATCH /api/me/notif-prefs   # SMS / WhatsApp / digest toggles
POST   /api/me/device-tokens                                    # register FCM token
GET    /api/admin/metrics?node=     GET   /api/admin/triage      GET /api/admin/safety  # 3.1–3.3
GET    /api/admin/pros?node=        GET   /api/admin/billing                            # 3.4/3.6
GET    /api/billing/subscription    POST  /api/billing/coupon
POST   /api/billing/webhook                                     # Stripe events
```

---

## 5. Seed data
The prototype uses consistent sample data you can seed for parity: node `southwest-us-04`; pros Marcus Bell (plumbing), Tasha Quinn (drywall), Leo Park (electrical), Ramon Alvarez (HVAC), Bea Foster (tile); homeowners Priya Shah, Tom Jenkins, Dana Whitfield; manager Dana Cruz; run-rate $2,838.58 across 142 pros; sample Krafts "Copper riser re-pipe $1,840", "Condenser swap $3,400".
```
