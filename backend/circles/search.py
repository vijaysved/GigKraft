import json
import logging

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are a home services and education category classifier. "
    "Given a natural language task description, return a JSON array of the most relevant "
    "Gigkraft skill category strings (e.g. Plumbing, Electrical, Tutoring, Painting). "
    "Return 1-4 categories, most relevant first. Output ONLY the JSON array, no explanation."
)


def map_query(query: str) -> list:
    """Map a natural-language task query to skill category strings via Claude Haiku."""
    try:
        import anthropic

        client = anthropic.Anthropic()
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=128,
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": query}],
        )
        return json.loads(message.content[0].text)
    except Exception:
        logger.exception("circle search: LLM map_query failed, falling back to keyword split")
        return _keyword_fallback(query)


def _keyword_fallback(query: str) -> list:
    """Simple keyword extraction used if the LLM call fails."""
    stop_words = {"a", "an", "the", "my", "i", "need", "help", "fix", "want", "get"}
    words = [w.strip(".,!?") for w in query.lower().split() if w not in stop_words and len(w) > 2]
    return words[:4]
