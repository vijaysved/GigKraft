"""Smoke tests for the Community Directory feature (run against sqlite)."""
import json

from django.test import Client, TestCase
from django.utils import timezone

from accounts.models import ProProfile, User
from accounts.tokens import create_access_token
from billing.models import CommunitySubscription
from communities.models import Community, CommunityMember
from referrals.models import ReferrerPro


class ApiTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def post_json(self, path, data, **extra):
        return self.client.post(path, data=json.dumps(data), content_type="application/json", **extra)

    def patch_json(self, path, data, **extra):
        return self.client.patch(path, data=json.dumps(data), content_type="application/json", **extra)

    def auth_header(self, user):
        return {"HTTP_AUTHORIZATION": f"Bearer {create_access_token(user)}"}


def make_referrer(email="alex@example.com"):
    return User.objects.create_user(email=email, password="pw", role=User.Role.REFERRER, first_name="Alex")


class CommunityModelTests(TestCase):
    def test_slug_autogenerates_and_dedupes_on_collision(self):
        lead1 = make_referrer("lead1@example.com")
        lead2 = make_referrer("lead2@example.com")
        c1 = Community.objects.create(lead=lead1, name="Maple Street HOA")
        c2 = Community.objects.create(lead=lead2, name="Maple Street HOA")
        self.assertEqual(c1.slug, "maple-street-hoa")
        self.assertEqual(c2.slug, "maple-street-hoa-1")
        self.assertTrue(c1.short_code)
        self.assertNotEqual(c1.short_code, c2.short_code)

    def test_archived_is_publicly_visible_and_read_only(self):
        lead = make_referrer()
        community = Community.objects.create(lead=lead, name="Test", status=Community.Status.ARCHIVED)
        self.assertTrue(community.is_publicly_visible)
        self.assertTrue(community.is_read_only)

    def test_active_without_subscription_is_not_publicly_visible(self):
        lead = make_referrer()
        community = Community.objects.create(lead=lead, name="Test")
        self.assertFalse(community.is_publicly_visible)

    def test_past_due_within_grace_period_is_visible(self):
        lead = make_referrer()
        community = Community.objects.create(lead=lead, name="Test")
        CommunitySubscription.objects.create(
            community=community,
            status=CommunitySubscription.Status.PAST_DUE,
            past_due_since=timezone.now() - timezone.timedelta(days=3),
        )
        self.assertTrue(community.is_publicly_visible)

    def test_past_due_past_grace_period_is_not_visible(self):
        lead = make_referrer()
        community = Community.objects.create(lead=lead, name="Test")
        CommunitySubscription.objects.create(
            community=community,
            status=CommunitySubscription.Status.PAST_DUE,
            past_due_since=timezone.now() - timezone.timedelta(days=8),
        )
        self.assertFalse(community.is_publicly_visible)

    def test_member_otp_roundtrip(self):
        lead = make_referrer()
        community = Community.objects.create(lead=lead, name="Test")
        member = CommunityMember.objects.create(community=community, name="Priya", phone="555-000-1111")
        member.set_otp("123456")
        self.assertTrue(member.check_otp("123456"))
        self.assertFalse(member.check_otp("000000"))


class CommunityApiTests(ApiTestCase):
    def _active_community(self, lead):
        community = Community.objects.create(lead=lead, name="Maple Street HOA")
        CommunitySubscription.objects.create(community=community, status=CommunitySubscription.Status.ACTIVE)
        return community

    def test_public_page_hidden_when_no_subscription(self):
        lead = make_referrer()
        community = Community.objects.create(lead=lead, name="Test")
        resp = self.client.get(f"/api/communities/{community.slug}")
        self.assertEqual(resp.status_code, 200, resp.content)
        self.assertFalse(resp.json()["is_publicly_visible"])

    def test_public_page_visible_when_active(self):
        lead = make_referrer()
        community = self._active_community(lead)
        resp = self.client.get(f"/api/communities/{community.slug}")
        self.assertEqual(resp.status_code, 200, resp.content)
        body = resp.json()
        self.assertTrue(body["is_publicly_visible"])
        self.assertEqual(body["pro_count"], 0)

    def test_join_via_phone_otp(self):
        lead = make_referrer()
        community = self._active_community(lead)
        member = CommunityMember.objects.create(community=community, name="Sarah", phone="925-555-1234")

        resp = self.client.post(f"/api/communities/{community.slug}/join/{member.token}/send-otp")
        self.assertEqual(resp.status_code, 200, resp.content)

        member.refresh_from_db()
        # send-otp's generated code isn't returned over the API by design; drive it directly instead.
        member.set_otp("654321")
        member.save(update_fields=["otp_code_hash", "otp_expires_at"])

        resp = self.post_json(f"/api/communities/{community.slug}/join/{member.token}", {"otp_code": "654321"})
        self.assertEqual(resp.status_code, 200, resp.content)
        member.refresh_from_db()
        self.assertEqual(member.status, CommunityMember.Status.JOINED)
        self.assertTrue(member.phone_verified)

    def test_join_rejects_wrong_otp(self):
        lead = make_referrer()
        community = self._active_community(lead)
        member = CommunityMember.objects.create(community=community, name="Sarah", phone="925-555-1234")
        member.set_otp("111111")
        member.save(update_fields=["otp_code_hash", "otp_expires_at"])

        resp = self.post_json(f"/api/communities/{community.slug}/join/{member.token}", {"otp_code": "000000"})
        self.assertEqual(resp.status_code, 400)

    def test_join_blocked_when_archived(self):
        lead = make_referrer()
        community = self._active_community(lead)
        community.status = Community.Status.ARCHIVED
        community.save(update_fields=["status"])
        member = CommunityMember.objects.create(community=community, name="Sarah", phone="925-555-1234")
        member.set_otp("111111")
        member.save(update_fields=["otp_code_hash", "otp_expires_at"])

        resp = self.post_json(f"/api/communities/{community.slug}/join/{member.token}", {"otp_code": "111111"})
        self.assertEqual(resp.status_code, 400)

    def test_moderator_cannot_promote_or_touch_settings(self):
        lead = make_referrer()
        community = self._active_community(lead)
        mod_user = User.objects.create_user(email="mod@example.com", password="pw", role=User.Role.MEMBER)
        member = CommunityMember.objects.create(
            community=community, name="Priya", phone="925-555-0000",
            role=CommunityMember.Role.MODERATOR, status=CommunityMember.Status.JOINED, user=mod_user,
        )
        other = CommunityMember.objects.create(
            community=community, name="Other", phone="925-555-2222",
            status=CommunityMember.Status.JOINED,
        )

        headers = self.auth_header(mod_user)
        resp = self.patch_json("/api/me/community", {"name": "Hacked"}, **headers)
        self.assertEqual(resp.status_code, 403)

        resp = self.post_json(f"/api/me/community/members/{other.pk}/role", {"role": "moderator"}, **headers)
        self.assertEqual(resp.status_code, 403)

    def test_owner_can_promote_and_demote_moderator(self):
        lead = make_referrer()
        community = self._active_community(lead)
        member_user = User.objects.create_user(email="priya@example.com", password="pw", role=User.Role.MEMBER)
        member = CommunityMember.objects.create(
            community=community, name="Priya", phone="925-555-0000",
            status=CommunityMember.Status.JOINED, user=member_user,
        )

        headers = self.auth_header(lead)
        resp = self.post_json(f"/api/me/community/members/{member.pk}/role", {"role": "moderator"}, **headers)
        self.assertEqual(resp.status_code, 200, resp.content)
        member.refresh_from_db()
        self.assertEqual(member.role, CommunityMember.Role.MODERATOR)

        resp = self.post_json(f"/api/me/community/members/{member.pk}/role", {"role": "member"}, **headers)
        self.assertEqual(resp.status_code, 200, resp.content)
        member.refresh_from_db()
        self.assertEqual(member.role, CommunityMember.Role.MEMBER)

    def test_show_on_community_independent_of_show_on_page(self):
        lead = make_referrer()
        community = self._active_community(lead)
        pro_user = User.objects.create_user(email="pro@example.com", password="pw", role=User.Role.PRO)
        pro = ProProfile.objects.create(user=pro_user)
        rp = ReferrerPro.objects.create(referrer=lead, pro=pro, show_on_page=True)

        headers = self.auth_header(lead)
        resp = self.post_json("/api/me/community/pros/toggle", {"referrer_pro_id": rp.pk}, **headers)
        self.assertEqual(resp.status_code, 200, resp.content)
        rp.refresh_from_db()
        self.assertTrue(rp.show_on_community)
        self.assertTrue(rp.show_on_page)

        rp.show_on_page = False
        rp.save(update_fields=["show_on_page"])
        rp.refresh_from_db()
        self.assertTrue(rp.show_on_community)
        self.assertFalse(rp.show_on_page)
