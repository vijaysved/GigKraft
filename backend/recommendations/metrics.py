"""Backend mirror of the frontend's encodeRecText/decodeRecText
(frontend/src/api/recommendations.ts) — the per-review yes/no metric tags are
packed into Recommendation.text as `§{json}§\\n{review text}` rather than
living in their own columns, so this is the only place that unpacks them."""
import json
import re

METRIC_SEP = "§"  # "§" — must match METRIC_SEP in frontend/src/api/recommendations.ts
_METRIC_RE = re.compile(rf"^{METRIC_SEP}(.+?){METRIC_SEP}\n([\s\S]*)$")


def decode_rec_metrics(raw: str) -> dict | None:
    match = _METRIC_RE.match(raw or "")
    if not match:
        return None
    try:
        return json.loads(match.group(1))
    except (ValueError, TypeError):
        return None
