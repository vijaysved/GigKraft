/** Shared phone/date/time formatting — use these everywhere instead of ad hoc
 * toLocaleDateString/toLocaleString calls so every screen renders the same format. */

/** Formats digits into "(XXX) XXX-XXXX" as the user types (masking, not just display). */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** "Jul 8, 2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** "Jul 8" — for narrow table columns only. */
export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "Jul 8, 2026, 3:45 PM" */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

/** "3:45 PM" */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** "Jul 2026" — for review/testimonial dates where day granularity isn't shown. */
export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Partially masks a phone number, e.g. "(925) 555-1234" -> "(925) ***-1234" */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return phone.length > 2 ? `${phone.slice(0, 2)}***` : "***";
  const area = digits.slice(-10, -7);
  const last4 = digits.slice(-4);
  return `(${area}) ***-${last4}`;
}

/** Partially masks an email, e.g. "john.doe@gmail.com" -> "j***e@g**.com" */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const maskedLocal = local.length <= 2 ? `${local[0]}**` : `${local[0]}***${local[local.length - 1]}`;
  const domainParts = domain.split(".");
  const tld = domainParts.pop() ?? "";
  const maskedDomain = `${domainParts.join(".")[0] ?? ""}**`;
  return `${maskedLocal}@${maskedDomain}.${tld}`;
}
