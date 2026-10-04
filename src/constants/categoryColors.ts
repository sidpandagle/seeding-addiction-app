/**
 * Stoic wisdom card categories
 * The card itself is neutral; the category shows as a sage chip and a faint background icon
 */

export type StoicCategory = 'control' | 'discipline' | 'resilience' | 'wisdom' | 'virtue';

/**
 * lucide-react-native icon name for each category
 */
const CATEGORY_ICONS: Record<StoicCategory, string> = {
  control: 'Target',
  discipline: 'Dumbbell',
  resilience: 'Shield',
  wisdom: 'Lightbulb',
  virtue: 'Heart',
};

/**
 * Get icon name for a category
 */
export function getCategoryIcon(category: StoicCategory): string {
  return CATEGORY_ICONS[category];
}
