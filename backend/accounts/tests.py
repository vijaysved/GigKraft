"""Smoke tests for the Milestone 2 auth surface (run against sqlite)."""
import json
import unittest.mock

from django.test import Client, TestCase

from accounts.models import HomeownerProfile, NotificationPref, ProProfile, SavedPro, User
from accounts.tokens import create_access_token
from emergencies.models import BroadcastDispatch
from krafts.models import Kraft
from leads.models import Lead
from nodes.models import Node


class ApiTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def post_json(self, path, data, **extra):
        return self.client.post(
            path, data=json.dumps(data), content_type="application/json", **extra
        )


class HealthTests(ApiTestCase):
    def test_health(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["status"], "ok")
        self.assertTrue(body["mocks"]["twilio"])

    def test_docs(self):
        resp = self.client.get("/api/docs")
        self.assertEqual(resp.status_code, 200)


class EmailPasswordAuthTests(ApiTestCase):
    def test_register_login_refresh_me(self):
        resp = self.post_json(
            "/api/auth/register",
            {
                "email": "manager@gigkraft.dev",
                "password": "s3curePass!",
                "role": "node_manager",
            },
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        body = resp.json()
        self.assertIn("access", body)
        self.assertIn("refresh", body)
        self.assertEqual(body["user"]["role"], "node_manager")

        resp = self.post_json(
            "/api/auth/login",
            {"email": "manager@gigkraft.dev", "password": "s3curePass!"},
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        tokens = resp.json()

        resp = self.post_json("/api/auth/refresh", {"refresh": tokens["refresh"]})
        self.assertEqual(resp.status_code, 200, resp.content)
        access = resp.json()["access"]

        resp = self.client.get(
            "/api/me", HTTP_AUTHORIZATION=f"Bearer {access}"
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()["email"], "manager@gigkraft.dev")

    def test_me_requires_auth(self):
        resp = self.client.get("/api/me")
        self.assertEqual(resp.status_code, 401)

    def test_refresh_token_rejected_as_access(self):
        self.post_json(
            "/api/auth/register",
            {"email": "m2@gigkraft.dev", "password": "s3curePass!"},
        )
        resp = self.post_json(
            "/api/auth/login",
            {"email": "m2@gigkraft.dev", "password": "s3curePass!"},
        )
        refresh = resp.json()["refresh"]
        resp = self.client.get("/api/me", HTTP_AUTHORIZATION=f"Bearer {refresh}")
        self.assertEqual(resp.status_code, 401)

    def test_login_wrong_password(self):
        self.post_json(
            "/api/auth/register",
            {"email": "m3@gigkraft.dev", "password": "s3curePass!"},
        )
        resp = self.post_json(
            "/api/auth/login",
            {"email": "m3@gigkraft.dev", "password": "wrong-password"},
        )
        self.assertEqual(resp.status_code, 401)

    def test_register_with_node(self):
        Node.objects.create(node_id="austin", name="Austin", center_zip="78701")
        resp = self.post_json(
            "/api/auth/register",
            {
                "email": "austin-mgr@gigkraft.dev",
                "password": "s3curePass!",
                "role": "node_manager",
                "node_id": "austin",
            },
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertEqual(resp.json()["user"]["node_id"], "austin")


class OtpMockAuthTests(ApiTestCase):
    def test_otp_request_returns_deterministic_dev_code(self):
        resp = self.post_json("/api/auth/otp/request", {"phone": "+15550001111"})
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        self.assertTrue(body["mock"])
        self.assertEqual(body["dev_code"], "123456")

    def test_otp_verify_creates_pro_with_profile(self):
        resp = self.post_json(
            "/api/auth/otp/verify",
            {"phone": "+15550001111", "code": "123456", "role": "pro"},
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        user = User.objects.get(phone="+15550001111")
        self.assertEqual(user.role, "pro")
        self.assertTrue(ProProfile.objects.filter(user=user).exists())

    def test_otp_verify_creates_homeowner_with_profile(self):
        resp = self.post_json(
            "/api/auth/otp/verify",
            {"phone": "+15550002222", "code": "123456", "role": "homeowner"},
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        user = User.objects.get(phone="+15550002222")
        self.assertTrue(HomeownerProfile.objects.filter(user=user).exists())

    def test_otp_verify_bad_code(self):
        resp = self.post_json(
            "/api/auth/otp/verify",
            {"phone": "+15550001111", "code": "000000", "role": "pro"},
        )
        self.assertEqual(resp.status_code, 401)


class GoogleAuthTests(ApiTestCase):
    def test_google_valid_token_signs_in_as_homeowner_by_default(self):
        with unittest.mock.patch("accounts.services.verify_google_token", return_value="user@gigkraft.dev"):
            resp = self.post_json("/api/auth/google", {"id_token": "fake-id-token"})
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        self.assertEqual(body["user"]["email"], "user@gigkraft.dev")
        self.assertEqual(body["user"]["role"], "homeowner")

    def test_google_valid_token_signs_in_as_pro(self):
        with unittest.mock.patch("accounts.services.verify_google_token", return_value="pro@gigkraft.dev"):
            resp = self.post_json("/api/auth/google", {"id_token": "fake-id-token", "role": "pro"})
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        self.assertEqual(body["user"]["email"], "pro@gigkraft.dev")
        self.assertEqual(body["user"]["role"], "pro")

    def test_google_invalid_token_returns_401(self):
        with unittest.mock.patch("accounts.services.verify_google_token", return_value=None):
            resp = self.post_json("/api/auth/google", {"id_token": "bad-token"})
        self.assertEqual(resp.status_code, 401)


class M5CoreFlowTests(ApiTestCase):
    def setUp(self):
        super().setUp()
        self.node = Node.objects.create(
            node_id="austin-tx",
            name="Austin TX",
            center_zip="78701",
            auto_blast=True,
        )
        self.pro_user = User.objects.create_user(
            email="pro@gigkraft.dev",
            password="pass",
            role=User.Role.PRO,
            node=self.node,
            first_name="Sam",
            last_name="Waters",
        )
        self.pro = ProProfile.objects.create(
            user=self.pro_user,
            business_name="Waters Plumbing",
            primary_trade="plumbing",
            base_zip="78701",
            service_zips=["78701", "78702"],
            is_verified=True,
        )
        self.home_user = User.objects.create_user(
            phone="+15550003333",
            password="pass",
            role=User.Role.HOMEOWNER,
            node=self.node,
            first_name="Taylor",
            last_name="Home",
        )
        self.home = HomeownerProfile.objects.create(
            user=self.home_user,
            default_zip="78701",
        )
        self.manager = User.objects.create_user(
            email="manager@gigkraft.dev",
            password="pass",
            role=User.Role.NODE_MANAGER,
            node=self.node,
        )

    def auth(self, user):
        return {"HTTP_AUTHORIZATION": f"Bearer {create_access_token(user)}"}

    def test_kraft_publish_requires_after_photo_and_confirmed_invoice(self):
        resp = self.post_json(
            "/api/krafts",
            {
                "title": "Pipe repair",
                "description": "Repaired leaking sink",
                "invoice_cost": 300,
                "invoice_confirmed": False,
                "photos": [],
            },
            **self.auth(self.pro_user),
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        kraft_id = resp.json()["id"]

        resp = self.client.post(
            f"/api/krafts/{kraft_id}/publish",
            content_type="application/json",
            **self.auth(self.pro_user),
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("After", resp.json()["detail"])
        self.assertEqual(Kraft.objects.get(pk=kraft_id).status, Kraft.Status.DRAFT)

        resp = self.client.patch(
            f"/api/krafts/{kraft_id}",
            data=json.dumps(
                {
                    "invoice_confirmed": True,
                    "photos": [
                        {
                            "kind": "after",
                            "image_url": "https://example.com/after.jpg",
                            "order": 0,
                        }
                    ],
                }
            ),
            content_type="application/json",
            **self.auth(self.pro_user),
        )
        self.assertEqual(resp.status_code, 200, resp.content)

        resp = self.client.post(
            f"/api/krafts/{kraft_id}/publish",
            content_type="application/json",
            **self.auth(self.pro_user),
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()["status"], Kraft.Status.PENDING)

    def test_service_area_zip_list_and_radius_are_validated_without_map(self):
        resp = self.client.patch(
            "/api/pros/me/service-area",
            data=json.dumps(
                {
                    "service_mode": "radial",
                    "base_zip": "78701",
                    "service_center_zip": "78704",
                    "service_radius_miles": 35,
                }
            ),
            content_type="application/json",
            **self.auth(self.pro_user),
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()["service_mode"], "radial")
        self.assertEqual(resp.json()["service_radius_miles"], 35)

        resp = self.client.patch(
            "/api/pros/me/service-area",
            data=json.dumps({"service_zips": ["78701", "78702", "78703", "78704"]}),
            content_type="application/json",
            **self.auth(self.pro_user),
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("At most 3", resp.json()["detail"])

    def test_emergency_broadcast_mock_dispatch_and_claim_creates_lead(self):
        resp = self.post_json(
            "/api/emergencies",
            {
                "kind": "burst",
                "description": "Pipe burst under sink",
                "address": "100 Congress Ave",
                "zip": "78701",
                "budget_ceiling": 250,
            },
            **self.auth(self.home_user),
        )
        self.assertEqual(resp.status_code, 201, resp.content)
        broadcast_id = resp.json()["id"]
        self.assertEqual(BroadcastDispatch.objects.count(), 2)

        resp = self.client.post(
            f"/api/emergencies/{broadcast_id}/claim",
            content_type="application/json",
            **self.auth(self.pro_user),
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        self.assertEqual(body["status"], "claimed")
        self.assertIsNotNone(body["lead_id"])
        self.assertTrue(Lead.objects.filter(pk=body["lead_id"], pro=self.pro).exists())

    def test_homeowner_account_saved_pros_jobs_and_prefs_have_no_payments(self):
        SavedPro.objects.create(homeowner=self.home, pro=self.pro)
        NotificationPref.objects.create(
            user=self.home_user,
            sms_alerts=True,
            whatsapp_dispatch=False,
            weekly_digest=False,
        )

        resp = self.client.get("/api/home/account", **self.auth(self.home_user))
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()["stats"]["saved_pros"], 1)

        resp = self.client.get("/api/home/saved-pros", **self.auth(self.home_user))
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json()[0]["name"], "Waters Plumbing")

        resp = self.client.get("/api/home/jobs", **self.auth(self.home_user))
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertEqual(resp.json(), [])

        resp = self.client.get("/api/me/notif-prefs", **self.auth(self.home_user))
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertFalse(resp.json()["whatsapp_dispatch"])
