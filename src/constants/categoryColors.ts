/**
 * Category color mappings for stoic wisdom cards
 * Single source of truth for all category-based styling
 */

export type StoicCategory = 'control' | 'discipline' | 'resilience' | 'wisdom' | 'virtue';

interface CategoryColors {
  background: string;
  text: string;
}

/**
 * Color mappings for each stoic category
 * Uses Tailwind CSS classes with dark mode support
 */
export const CATEGORY_COLORS: Record<StoicCategory, CategoryColors> = {
  control: {
    background: 'border bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
  },
  discipline: {
    background: 'border bg-purple-100 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700',
    text: 'text-purple-700 dark:text-purple-300',
  },
  resilience: {
    background: 'border bg-amber-100 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700',
    text: 'text-amber-700 dark:text-amber-300',
  },
  wisdom: {
    background: 'border bg-emerald-100 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  virtue: {
    background: 'border bg-rose-100 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700',
    text: 'text-rose-700 dark:text-rose-300',
  },
};

/**
 * Get background color classes for a category
 */
export function getCategoryBackgroundColor(category: StoicCategory): string {
  return CATEGORY_COLORS[category].background;
}

/**
 * Get text color classes for a category
 */
export function getCategoryTextColor(category: StoicCategory): string {
  return CATEGORY_COLORS[category].text;
}
