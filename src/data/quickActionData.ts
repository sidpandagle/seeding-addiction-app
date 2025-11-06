/**
 * Quick action data for urge resistance
 * Shared between QuickActions component and EmergencyHelpModal
 */

export interface QuickAction {
  id: string;
  icon: string;
  title: string;
  role: string;
  bulletPoints: string[];
  supportiveMessage: string;
  colorScheme: 'blue' | 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'teal';
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'physical-reset',
    icon: '💪',
    title: 'Physical Reset',
    role: 'Break the mental loop by moving your body with intent',
    bulletPoints: [
      'Do 10 push-ups or you could take a cold shower',
      'Go for a walk or quick jog',
      'Use the urge’s energy to move — not to waste'
    ],
    supportiveMessage: 'Every bit of motion breaks the cycle. Movement reminds your brain who’s in charge and rewires your energy toward strength, not release.',
    colorScheme: 'amber',
  },
  {
    id: 'breathe',
    icon: '🌬️',
    title: 'Breathe, Seriously',
    role: 'Slow down your heartbeat and reset your mind',
    bulletPoints: [
      'Inhale for 4 seconds, hold for 4, exhale for 4',
      'Repeat 5 times — longer if needed',
      'Focus only on the air moving through you'
    ],
    supportiveMessage: 'Breathing is your reset button. With every exhale, you’re releasing pressure and reclaiming peace. The storm passes when you breathe through it — not fight it.',
    colorScheme: 'emerald',
  },
  {
    id: 'mental-distraction',
    icon: '🧘',
    title: 'Shift the Focus',
    role: 'Redirect your attention to something that builds you',
    bulletPoints: [
      'Call a friend or dive into a hobby',
      'Watch something inspiring or read a few pages',
      'Do something that nourishes your curiosity'
    ],
    supportiveMessage: 'Urges feed on attention. The moment you focus elsewhere, they lose their grip. Turn your energy toward growth — curiosity, creation, and learning always win.',
    colorScheme: 'cyan',
  },
  {
    id: 'remember-why',
    icon: '🎯',
    title: 'Remember Your Why',
    role: 'Reconnect with your purpose and long-term vision',
    bulletPoints: [
      'Think about your goals and the person you’re becoming',
      'Recall what pain you’re leaving behind',
      'Visualize your future self — calm, confident, free'
    ],
    supportiveMessage: 'You’re not just avoiding something — you’re building someone. Each moment of strength today shapes the version of you that’s unstoppable tomorrow.',
    colorScheme: 'blue',
  },
];

export const EMERGENCY_ACTIONS: QuickAction[] = [
  ...QUICK_ACTIONS,
  {
    id: 'redirect-energy',
    icon: '🎮',
    title: 'Redirect the Energy',
    role: 'Turn that raw intensity into action',
    bulletPoints: [
      'Tidy your room or do quick chores',
      'Play a short game or solve a challenge',
      'Create something — write, draw, build, code'
    ],
    supportiveMessage: 'That urge isn’t weakness — it’s raw energy. You can shape it into progress. Every time you channel it into action, you prove to yourself that desire can serve you, not rule you.',
    colorScheme: 'purple',
  },
  {
    id: 'fuel-brain',
    icon: '🍎',
    title: 'Fuel Your Brain',
    role: 'Sometimes your body just needs care, not dopamine',
    bulletPoints: [
      'Drink a glass of water slowly',
      'Eat fruits or nuts — something real, not processed',
      'Stretch or take a mindful pause'
    ],
    supportiveMessage: 'Cravings can be hunger or fatigue in disguise. Feed your brain what it truly needs, and you’ll notice the fog lift. Real fuel. Real clarity.',
    colorScheme: 'rose',
  },
  {
    id: 'write-it-out',
    icon: '📝',
    title: 'Write It Out',
    role: 'Let your emotions breathe on paper',
    bulletPoints: [
      'Write what you feel — anger, boredom, shame, hope',
      'Don’t edit. Don’t judge. Just release.',
      'Revisit it later to see how far you’ve come'
    ],
    supportiveMessage: 'You don’t need to carry every thought inside your head. Writing frees your mind and gives you perspective. Healing begins when the chaos meets the page.',
    colorScheme: 'indigo',
  },
  {
    id: 'change-soundtrack',
    icon: '🎵',
    title: 'Change the Soundtrack',
    role: 'Shift your emotional state instantly with music',
    bulletPoints: [
      'Play your power song — something that lifts you',
      'Move to the rhythm — even a head nod counts',
      'Let the music guide your mood to higher ground'
    ],
    supportiveMessage: 'Music hacks your mood faster than willpower ever can. You’re one song away from a better state. Let sound carry you to focus, strength, and calm.',
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
