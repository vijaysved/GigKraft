const AVATARS = [
  "/generic-profile-images/f1.jpg",
  "/generic-profile-images/f2.jpg",
  "/generic-profile-images/f3.jpg",
  "/generic-profile-images/f4.jpg",
  "/generic-profile-images/f5.jpg",
  "/generic-profile-images/m1.jpg",
  "/generic-profile-images/m2.jpg",
  "/generic-profile-images/m3.jpg",
  "/generic-profile-images/m4.jpg",
  "/generic-profile-images/m5.jpg",
];

/** Picks a consistent fallback portrait for a given numeric ID or string seed. */
export function fallbackAvatar(seed: string | number): string {
  const n =
    typeof seed === "number"
      ? seed
      : [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATARS[Math.abs(n) % AVATARS.length];
}
