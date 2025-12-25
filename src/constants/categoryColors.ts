/**
 * Category color mappings for stoic wisdom cards
 * Single source of truth for all category-based styling
 */

export type StoicCategory = 'control' | 'discipline' | 'resilience' | 'wisdom' | 'virtue';

interface IconOptions {
  primary: string;
  alternatives: string[];
}

interface CategoryColors {
  background: string;
  text: string;
  icon: IconOptions;
  iconColor: string; // Hex color for the icon
}

/**
 * Color mappings for each stoic category
 * Uses Tailwind CSS classes with dark mode support
 * Icons use lucide-react-native components
 */
export const CATEGORY_COLORS: Record<StoicCategory, CategoryColors> = {
  control: {
    background: 'border bg-blue-100 dark:bg-blue-950/30 border-blue-100 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
    icon: {
      primary: 'Target',
      alternatives: ['Compass', 'Anchor', 'Crosshair'],
    },
    iconColor: '#3b82f6', // blue-500
  },
  discipline: {
    background: 'border bg-purple-100 dark:bg-purple-950/30 border-purple-100 dark:border-purple-700',
    text: 'text-purple-700 dark:text-purple-300',
    icon: {
      primary: 'Dumbbell',
      alternatives: ['Shield', 'Zap', 'Flame'],
    },
    iconColor: '#a855f7', // purple-500
  },
  resilience: {
    background: 'border bg-amber-100 dark:bg-amber-950/30 border-amber-100 dark:border-amber-700',
    text: 'text-amber-700 dark:text-amber-300',
    icon: {
      primary: 'Shield',
      alternatives: ['Anchor', 'TreePine', 'Mountain'],
    },
    iconColor: '#f59e0b', // amber-500
  },
  wisdom: {
    background: 'border bg-emerald-100 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-700',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: {
      primary: 'Lightbulb',
      alternatives: ['BookOpen', 'Brain', 'Glasses'],
    },
    iconColor: '#10b981', // emerald-500
  },
  virtue: {
    background: 'border bg-rose-100 dark:bg-rose-950/30 border-rose-100 dark:border-rose-700',
    text: 'text-rose-700 dark:text-rose-300',
    icon: {
      primary: 'Heart',
      alternatives: ['Star', 'Crown', 'Gem'],
    },
    iconColor: '#f43f5e', // rose-500
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

/**
 * Get icon name for a category (returns primary icon)
 */
export function getCategoryIcon(category: StoicCategory): string {
  return CATEGORY_COLORS[category].icon.primary;
}

/**
 * Get icon color for a category
 */
export function getCategoryIconColor(category: StoicCategory): string {
  return CATEGORY_COLORS[category].iconColor;
}
