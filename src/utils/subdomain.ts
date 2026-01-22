/**
 * Subdomain generation utility
 */

const ADJECTIVES = [
  'swift',
  'bold',
  'calm',
  'dark',
  'eager',
  'fair',
  'glad',
  'happy',
  'keen',
  'lush',
  'mild',
  'nice',
  'pure',
  'quick',
  'rare',
  'safe',
  'warm',
  'wise',
  'zen',
  'cool',
];

const NOUNS = [
  'eagle',
  'bear',
  'deer',
  'fox',
  'hawk',
  'lion',
  'owl',
  'wolf',
  'tiger',
  'falcon',
  'panda',
  'seal',
  'crane',
  'dove',
  'finch',
  'heron',
  'ibis',
  'jay',
  'kite',
  'lark',
];

/**
 * Generate a random subdomain for deployment
 * Format: {adjective}-{noun}-{random} e.g., "swift-eagle-x7k9"
 */
export function generateSubdomain(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const rand = Math.random().toString(36).substring(2, 6);
  return `${adj}-${noun}-${rand}`;
}

/**
 * Generate a full luncurkan.app domain
 */
export function generateDomain(): string {
  return `https://${generateSubdomain()}.luncurkan.app`;
}
