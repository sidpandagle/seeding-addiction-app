/**
 * Quick action data for urge resistance
 * Shared between QuickActions component and EmergencyHelpModal
 */

export interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  colorScheme: 'blue' | 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'teal';
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'physical-reset',
    icon: '💪',
    title: 'Physical Reset',
    description: 'Do 10 push-ups or take a cold shower. Go for a walk or sprint. Your body needs to remember who\'s boss.',
    colorScheme: 'amber',
  },
  {
    id: 'breathe',
    icon: '🌬️',
    title: 'Breathe, Seriously',
    description: 'Breathe in for 4, hold for 4, out for 4. Repeat 5 times. Trick your nervous system into calming down.',
    colorScheme: 'emerald',
  },
  {
    id: 'mental-distraction',
    icon: '🧘',
    title: 'Mental Distraction',
    description: 'Call a friend or work on that hobby. Watch a documentary or meditate. Give your mind something else to focus on.',
    colorScheme: 'cyan',
  },
  {
    id: 'remember-why',
    icon: '🎯',
    title: 'Remember Your Why',
    description: 'Think about your goals. Why did you start this journey? Future you is rooting for present you.',
    colorScheme: 'blue',
  },
];

export const EMERGENCY_ACTIONS: QuickAction[] = [
  ...QUICK_ACTIONS,
  {
    id: 'redirect-energy',
    icon: '🎮',
    title: 'Redirect the Energy',
    description: 'Play a quick game or clean your room. Organize your desk or learn 5 new words. Channel that chaos into something productive.',
    colorScheme: 'purple',
  },
  {
    id: 'fuel-brain',
    icon: '🍎',
    title: 'Fuel Your Brain',
    description: 'Drink a full glass of water. Eat an apple or have some nuts. Sometimes your brain is just hangry.',
    colorScheme: 'rose',
  },
  {
    id: 'write-it-out',
    icon: '📝',
    title: 'Write It Out',
    description: 'Journal about how you feel right now. Write angry or write grateful. Just get it out of your head and onto paper.',
    colorScheme: 'indigo',
  },
  {
    id: 'change-soundtrack',
    icon: '🎵',
    title: 'Change the Soundtrack',
    description: 'Put on your favorite pump-up song. Dance like nobody\'s watching. Music changes moods faster than you think.',
    colorScheme: 'teal',
  },
];

/**
 * Get Tailwind color classes for a given color scheme
 */
export function getActionColorClasses(colorScheme: QuickAction['colorScheme']) {
  const colorMap = {
    blue: 'bg-blue-100 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700',
    cyan: 'bg-cyan-100 dark:bg-cyan-950/30 border border-cyan-300 dark:border-cyan-700',
    emerald: 'bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700',
    amber: 'bg-amber-100 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700',
    purple: 'bg-purple-100 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-700',
    rose: 'bg-rose-100 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-700',
    indigo: 'bg-indigo-100 dark:bg-indigo-950/30 border border-indigo-300 dark:border-indigo-700',
    teal: 'bg-teal-100 dark:bg-teal-950/30 border border-teal-300 dark:border-teal-700',
  };

  return colorMap[colorScheme];
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
