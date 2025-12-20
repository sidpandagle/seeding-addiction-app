/**
 * Emoji Validation Utility
 * Validates that input is actually an emoji character.
 * Handles: single emojis, multi-character emojis, flags, skin tones, ZWJ sequences
 */

/**
 * Check if a string contains only emoji characters
 * Uses regex that matches Unicode emoji ranges including:
 * - Basic emoji (Emoji_Presentation)
 * - Text emojis with variation selector (Emoji + FE0F)
 * - Emoji with skin tone modifiers
 * - Flag sequences (regional indicators)
 * - ZWJ (Zero Width Joiner) sequences
 */
export const isValidEmoji = (str: string): boolean => {
  if (!str || str.trim().length === 0) return false;

  // Comprehensive emoji regex pattern
  // Matches common emoji patterns including:
  // - Emoji presentation characters
  // - Emoji with text presentation selector
  // - Emoji with skin tone modifiers
  // - Regional indicator pairs (flags)
  const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Regional_Indicator}{2}|[\u{1F3F4}][\u{E0060}-\u{E007F}]+)+$/u;

  return emojiRegex.test(str.trim());
};

/**
 * Extract first emoji from a string (for normalization)
 * Useful for extracting a single emoji from longer input
 */
export const extractFirstEmoji = (str: string): string | null => {
  if (!str) return null;

  // Match the first emoji sequence
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Regional_Indicator}{2}|[\u{1F3F4}][\u{E0060}-\u{E007F}]+)/u;
  const match = str.match(emojiRegex);

  return match ? match[0] : null;
};

/**
 * Check if a string appears to contain at least one emoji
 * Less strict than isValidEmoji - allows text mixed with emoji
 */
export const containsEmoji = (str: string): boolean => {
  if (!str) return false;

  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base})/u;
  return emojiRegex.test(str);
};
