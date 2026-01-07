/**
 * Download Noto Emoji Animation Lottie files for the emojis used in the Seeding app
 *
 * Usage: npx ts-node scripts/downloadNotoEmojis.ts
 *
 * Downloads:
 * - Badge emojis (from badgeDefinitions.ts)
 * - Growth stage emojis (from growthStages.ts)
 * - Total: ~37 unique emojis
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// All unique emojis used in the app
const APP_EMOJIS = [
  // Badge emojis
  '🌱', '🔥', '💪', '🏆', '⭐', '🎯', '🎉', '🌟', '✨', '💫',
  '🚀', '👑', '🎨', '⚖️', '🌈', '🧘', '🤝', '📚', '📆', '🎊',
  '🏅', '🧠', '💭', '🌙', '⏰', '🎭',

  // Growth stage emojis
  '🫘', '🌿', '☘️', '🍀', '🪴', '🌾', '🍃', '🌼', '🌷', '🌻',
  '🌴', '🌲', '🌳'
];

// Remove duplicates
const UNIQUE_EMOJIS = Array.from(new Set(APP_EMOJIS));

const NOTO_CDN_BASE = 'https://fonts.gstatic.com/s/e/notoemoji/latest';
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'lottie', 'noto-emojis');

/**
 * Convert emoji character to Unicode codepoint (hex format)
 * Examples:
 * 🔥 → 1f525
 * 🌱 → 1f331
 * ⚖️ → 2696-fe0f
 */
function emojiToCodepoint(emoji: string): string {
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
 * Download a file from URL using Node's https module
 */
function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        if (response.headers.location) {
          file.close();
          fs.unlinkSync(outputPath);
          downloadFile(response.headers.location, outputPath)
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error(`Redirect without location header: ${response.statusCode}`));
        }
      } else {
        file.close();
        fs.unlinkSync(outputPath);
        reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(outputPath);
      reject(err);
    });
  });
}

/**
 * Main download function
 */
async function downloadNotoEmojis() {
  console.log('🎨 Noto Emoji Animation Downloader\n');
  console.log(`📦 Total emojis to download: ${UNIQUE_EMOJIS.length}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let successCount = 0;
  let failCount = 0;
  const failed: Array<{ emoji: string; codepoint: string; error: string }> = [];

  for (const emoji of UNIQUE_EMOJIS) {
    const codepoint = emojiToCodepoint(emoji);
    const url = `${NOTO_CDN_BASE}/${codepoint}/lottie.json`;
    const outputPath = path.join(OUTPUT_DIR, `${codepoint}.json`);

    try {
      // Check if already downloaded
      if (fs.existsSync(outputPath)) {
        console.log(`✅ ${emoji} (${codepoint}) - Already exists, skipping`);
        successCount++;
        continue;
      }

      // Download
      process.stdout.write(`⏳ Downloading ${emoji} (${codepoint})...`);
      await downloadFile(url, outputPath);
      console.log(' ✅');
      successCount++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(` ❌ Failed`);
      failCount++;
      failed.push({
        emoji,
        codepoint,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Successfully downloaded: ${successCount}/${UNIQUE_EMOJIS.length}`);
  console.log(`❌ Failed downloads: ${failCount}/${UNIQUE_EMOJIS.length}`);

  if (failed.length > 0) {
    console.log('\n❌ Failed emojis:');
    failed.forEach(({ emoji, codepoint, error }) => {
      console.log(`  - ${emoji} (${codepoint}): ${error}`);
    });
    console.log('\nℹ️  These emojis will fallback to static text in the app.');
  }

  console.log('\n✨ Done! Lottie files saved to:', OUTPUT_DIR);

  // Generate import map for next step
  console.log('\n📝 Next step: Run the mapping generator to create import files');
}

// Run the script
downloadNotoEmojis().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
