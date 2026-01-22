/**
 * UUID v7 generation utility
 */

/**
 * Generate UUID v7 (time-ordered UUID)
 * Format: xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUIDv7(): string {
  const timestamp = Date.now();
  const timestampHex = timestamp.toString(16).padStart(12, '0');

  // Random bytes for the rest
  const randomBytes = new Array(16)
    .fill(0)
    .map(() => Math.floor(Math.random() * 256));

  // Set version (7) and variant bits
  randomBytes[6] = ((randomBytes[6] ?? 0) & 0x0f) | 0x70; // version 7
  randomBytes[8] = ((randomBytes[8] ?? 0) & 0x3f) | 0x80; // variant 10

  // Combine timestamp with random bytes
  const hex = [
    timestampHex.slice(0, 8),
    timestampHex.slice(8, 12),
    randomBytes
      .slice(6, 8)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
    randomBytes
      .slice(8, 10)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
    randomBytes
      .slice(10, 16)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
  ];

  return hex.join('-');
}
