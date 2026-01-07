/**
 * Noto Emoji Animation Lottie file imports
 * Auto-generated mapping of codepoints to Lottie JSON files
 *
 * Total: 16 animated emojis
 */

export const NOTO_LOTTIE_FILES: Record<string, any> = {
  // Badge emojis
  '1f525': require('../../assets/lottie/noto-emojis/1f525.json'), // 🔥 Fire
  '1f4aa': require('../../assets/lottie/noto-emojis/1f4aa.json'), // 💪 Flexed Biceps
  '1f3c6': require('../../assets/lottie/noto-emojis/1f3c6.json'), // 🏆 Trophy
  '1f3af': require('../../assets/lottie/noto-emojis/1f3af.json'), // 🎯 Direct Hit
  '1f389': require('../../assets/lottie/noto-emojis/1f389.json'), // 🎉 Party Popper
  '1f31f': require('../../assets/lottie/noto-emojis/1f31f.json'), // 🌟 Glowing Star
  '2728': require('../../assets/lottie/noto-emojis/2728.json'),   // ✨ Sparkles
  '1f4ab': require('../../assets/lottie/noto-emojis/1f4ab.json'), // 💫 Dizzy
  '1f680': require('../../assets/lottie/noto-emojis/1f680.json'), // 🚀 Rocket
  '1f308': require('../../assets/lottie/noto-emojis/1f308.json'), // 🌈 Rainbow
  '1f91d': require('../../assets/lottie/noto-emojis/1f91d.json'), // 🤝 Handshake
  '1f38a': require('../../assets/lottie/noto-emojis/1f38a.json'), // 🎊 Confetti Ball
  '23f0': require('../../assets/lottie/noto-emojis/23f0.json'),   // ⏰ Alarm Clock

  // Growth stage emojis
  '1f340': require('../../assets/lottie/noto-emojis/1f340.json'), // 🍀 Four Leaf Clover
  '1f343': require('../../assets/lottie/noto-emojis/1f343.json'), // 🍃 Leaf Fluttering in Wind
};

/**
 * Get Lottie source for a given codepoint
 * Returns undefined if not available (will trigger fallback to static emoji)
 */
export function getLottieSource(codepoint: string): any | undefined {
  return NOTO_LOTTIE_FILES[codepoint];
}
