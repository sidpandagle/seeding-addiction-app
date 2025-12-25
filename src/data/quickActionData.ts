/**
 * Quick action data for urge resistance
 * Shared between QuickActions component and EmergencyHelpModal
 */

export interface QuickAction {
  id: string;
  icon: string;
  title: string;
  bulletPoints: string[];
  colorScheme: 'blue' | 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'teal';
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'physical-reset',
    icon: '💪',
    title: 'Physical Reset',
    bulletPoints: [
      'Do 10 push-ups or take a cold shower',
      'Go for a quick walk or short jog',
      'Turn that urge into movement, don’t waste it'
    ],
    colorScheme: 'amber',
  },
  {
    id: 'breathe',
    icon: '🌬️',
    title: 'Breathe. For Real.',
    bulletPoints: [
      'Inhale 4 sec → hold 4 → exhale 4',
      'Repeat 5 times (or more if needed)',
      'Lock in on the breath — nothing else'
    ],
    colorScheme: 'emerald',
  },
  {
    id: 'mental-distraction',
    icon: '🧘',
    title: 'Shift the Focus',
    bulletPoints: [
      'Text or call someone you trust',
      'Watch or read something that inspires you',
      'Do anything that feeds your curiosity'
    ],
    colorScheme: 'cyan',
  },
  {
    id: 'remember-why',
    icon: '🎯',
    title: 'Remember Your Why',
    bulletPoints: [
      'Think about your goals and future self',
      'Remember why you decided to change',
      'Picture yourself calm, confident, in control'
    ],
    colorScheme: 'blue',
  },
];


export const EMERGENCY_ACTIONS: QuickAction[] = [
  ...QUICK_ACTIONS,
  {
    id: 'redirect-energy',
    icon: '🎮',
    title: 'Redirect the Energy',
    bulletPoints: [
      'Tidy your room or do quick chores',
      'Play a short game or solve a challenge',
      'Create something — write, draw, build, code'
    ],
    colorScheme: 'purple',
  },
  {
    id: 'fuel-brain',
    icon: '🍎',
    title: 'Fuel Your Brain',
    bulletPoints: [
      'Drink a glass of water slowly',
      'Eat fruits or nuts — something real, not processed',
      'Stretch or take a mindful pause'
    ],
    colorScheme: 'rose',
  },
  {
    id: 'write-it-out',
    icon: '📝',
    title: 'Write It Out',
    bulletPoints: [
      'Write what you feel — anger, boredom, shame, hope',
      'Don’t edit. Don’t judge. Just release.',
      'Revisit it later to see how far you’ve come'
    ],
    colorScheme: 'indigo',
  },
  {
    id: 'change-soundtrack',
    icon: '🎵',
    title: 'Change the Soundtrack',
    bulletPoints: [
      'Play your power song — something that lifts you',
      'Move to the rhythm — even a head nod counts',
      'Let the music guide your mood to higher ground'
    ],
    colorScheme: 'teal',
  },
];

/**
 * Get Tailwind color classes for a given color scheme
 */
export function getActionColorClasses(colorScheme: QuickAction['colorScheme']) {
  const colorMap = {
    blue: 'bg-blue-100 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-700',
    cyan: 'bg-cyan-100 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-700',
    emerald: 'bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-700',
    amber: 'bg-amber-100 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-700',
    purple: 'bg-purple-100 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-700',
    rose: 'bg-rose-100 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-700',
    indigo: 'bg-indigo-100 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-700',
    teal: 'bg-teal-100 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-700',
  };

  return colorMap[colorScheme];
}

/**
 * Get border color classes for the divider between bullets and supportive message
 */
export function getActionDividerBorderColor(colorScheme: QuickAction['colorScheme']) {
  const borderColorMap = {
    blue: 'border-blue-300 dark:border-blue-700',
    cyan: 'border-cyan-300 dark:border-cyan-700',
    emerald: 'border-emerald-300 dark:border-emerald-700',
    amber: 'border-amber-300 dark:border-amber-700',
    purple: 'border-purple-300 dark:border-purple-700',
    rose: 'border-rose-300 dark:border-rose-700',
    indigo: 'border-indigo-300 dark:border-indigo-700',
    teal: 'border-teal-300 dark:border-teal-700',
  };

  return borderColorMap[colorScheme];
}

/**
 * Map quick action IDs to activity categories
 */
export function getQuickActionCategory(actionId: string): string | null {
  const categoryMap: Record<string, string> = {
    'physical-reset': '🏃 Physical',
    'breathe': '🧘 Mindfulness',
    'mental-distraction': '👥 Social',
    'remember-why': '🎯 Productive',
    'redirect-energy': '🎨 Creative',
    'fuel-brain': '🏃 Physical',
    'write-it-out': '📚 Learning',
    'change-soundtrack': '✨ Other',
  };

  return categoryMap[actionId] || null;
}
