const COLORS = [
  "#6C63FF", // indigo
  "#2EC4B6", // teal
  "#F4A261", // amber
  "#4C6EF5", // blue
  "#B76E79", // rose
  "#5B8C5A", // sage
  "#E07A5F", // terracotta
  "#8854D0", // violet
];

function silhouetteDataUri(color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<circle cx="50" cy="50" r="50" fill="${color}"/>` +
    `<circle cx="50" cy="38" r="16" fill="#fff" fill-opacity="0.9"/>` +
    `<path d="M50 58c-17 0-31 11-31 27v5a2 2 0 0 0 2 2h58a2 2 0 0 0 2-2v-5c0-16-14-27-31-27z" fill="#fff" fill-opacity="0.9"/>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Picks a consistent gender-neutral silhouette avatar for a given numeric ID or string seed. */
export function fallbackAvatar(seed: string | number): string {
  const n =
    typeof seed === "number"
      ? seed
      : [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return silhouetteDataUri(COLORS[Math.abs(n) % COLORS.length]);
}
