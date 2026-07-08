import re


def normalize_phone(raw: str | None) -> str:
    """Normalize a US phone number to the canonical "(XXX) XXX-XXXX" display format.

    Strips a leading "+1"/"1" country code when present. Numbers that aren't a
    recognizable 10-digit US number (wrong length, letters, etc.) are returned
    with only whitespace trimmed, so unusual data isn't silently destroyed.
    """
    if not raw:
        return raw or ""
    digits = re.sub(r"\D", "", raw)
    if len(digits) == 11 and digits[0] == "1":
        digits = digits[1:]
    if len(digits) != 10:
        return raw.strip()
    return f"({digits[0:3]}) {digits[3:6]}-{digits[6:10]}"
