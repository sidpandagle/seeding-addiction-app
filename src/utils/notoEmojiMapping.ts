/**
 * Noto Emoji Animation utilities
 * Provides emoji-to-codepoint mapping and helper functions
 */

/**
 * Convert emoji character to Unicode codepoint (hex format)
 * Examples:
 * 🔥 → 1f525
 * 🌱 → 1f331
 * ⚖️ → 2696-fe0f
 */
export function emojiToCodepoint(emoji: string): string {
  const codepoints = [];
  for (const char of emoji) {
    const codepoint = char.codePointAt(0);
    if (codepoint) {
      codepoints.push(codepoint.toString(16).toLowerCase());
    }
  }
  return codepoints.join('-');
}

/**
 * Map of emoji characters to their Unicode codepoints
 * Auto-generated based on successfully downloaded Noto Emoji Animation files
 *
 * ✅ Available (15 emojis with Lottie animations):
 * - 🔥 💪 🏆 🎯 🎉 🌟 ✨ 💫 🚀 🤝 🌈 🎊 ⏰ 🍀 🍃
 *
 * ❌ Not available (24 emojis - will fallback to static):
 * - 🌱 ⭐ 👑 🎨 ⚖️ 🧘 📚 📆 🏅 🧠 💭 🌙 🎭 🫘 🌿 ☘️ 🪴 🌾 🌼 🌷 🌻 🌴 🌲 🌳
 */
export const EMOJI_TO_CODEPOINT: Record<string, string> = {
  // Badge emojis (available)
  '🔥': '1f525', // Fire
  '💪': '1f4aa', // Flexed Biceps
  '🏆': '1f3c6', // Trophy
  '🎯': '1f3af', // Direct Hit
  '🎉': '1f389', // Party Popper
  '🌟': '1f31f', // Glowing Star
  '✨': '2728',  // Sparkles
  '💫': '1f4ab', // Dizzy
  '🚀': '1f680', // Rocket
  '🌈': '1f308', // Rainbow
  '🤝': '1f91d', // Handshake
  '🎊': '1f38a', // Confetti Ball
  '⏰': '23f0',  // Alarm Clock

  // Growth stage emojis (available)
  '🍀': '1f340', // Four Leaf Clover
  '🍃': '1f343', // Leaf Fluttering in Wind
};

/**
 * Check if an emoji has a Lottie animation available
 */
export function hasLottieAnimation(emoji: string): boolean {
  return emoji in EMOJI_TO_CODEPOINT;
}

/**
 * Get all available animated emojis
 */
export function getAvailableAnimatedEmojis(): string[] {
  return Object.keys(EMOJI_TO_CODEPOINT);
}

/**
 * Get statistics about emoji coverage
 */
export function getEmojiCoverageStats() {
  const totalEmojis = 39; // Total unique emojis in app (badges + growth stages)
  const availableCount = Object.keys(EMOJI_TO_CODEPOINT).length;
  const coveragePercentage = ((availableCount / totalEmojis) * 100).toFixed(1);

  return {
    total: totalEmojis,
    available: availableCount,
    missing: totalEmojis - availableCount,
    coverage: `${coveragePercentage}%`,
  };
}
