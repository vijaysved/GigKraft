/** Normalize a free-typed tag into lowerCamelCase, e.g. "Fast Response" -> "fastResponse". */
export function toCamelTag(raw: string): string {
  const words = raw.trim().replace(/^#+/, "").split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (words.length === 0) return "";
  const [first, ...rest] = words;
  return first.toLowerCase() + rest.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join("");
}
