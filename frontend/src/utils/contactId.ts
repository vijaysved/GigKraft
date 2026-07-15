// Obfuscates the numeric contact id shown in /contacts/:scenario/:id URLs so it
// doesn't read as a raw, guessable sequential database id. XOR is self-inverse,
// so encode and decode are the same bit-mix — this is display obfuscation only,
// not a security boundary (anyone reading the bundle can reverse it).
const MASK = 0x9e3779b1;

function scramble(n: number): number {
  return (n ^ MASK) >>> 0;
}

export function encodeContactId(id: number): string {
  return scramble(id).toString(36).padStart(10, "0");
}

export function decodeContactId(token: string): number | null {
  if (!/^[0-9a-z]{1,10}$/.test(token)) return null;
  const scrambled = parseInt(token, 36);
  if (Number.isNaN(scrambled)) return null;
  return scramble(scrambled);
}
