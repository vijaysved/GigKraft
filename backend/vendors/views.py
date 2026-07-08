"""Raw Django views — outside Ninja so the short /go/* links stay off /api/.

Mounted at the root in config/urls.py (e.g. /go/<token>), not under the
Ninja API prefix. The actual tracking logic lives in vendors/tracking.py,
shared with the legacy /api/prospects/track* endpoints.
"""
from vendors.tracking import handle_example_click, handle_signup_click


def go_signup(request, token: str):
    return handle_signup_click(token)


def go_example(request, token: str):
    return handle_example_click(token)
