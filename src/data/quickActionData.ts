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

// All bullet points for each action - displayed points are randomly selected
const PHYSICAL_RESET_BULLETS = [
  'Do 10 push-ups or take a cold shower',
  'Go for a quick walk or short jog',
  "Turn that urge into movement, don't waste it",
  "Do jumping jacks until you're out of breath",
  'Stretch for 5 minutes , release the tension',
  'Drop and hold a plank for 30 seconds',
  'Splash cold water on your face',
  'Dance to your favorite song',
  'Run up and down the stairs twice',
  'Do squats until your legs burn',
];

const BREATHE_BULLETS = [
  'Inhale 4 sec → hold 4 → exhale 4',
  'Repeat 5 times (or more if needed)',
  'Lock in on the breath , nothing else',
  'Try 4-7-8: inhale 4, hold 7, exhale 8',
  'Breathe deeply into your belly, not chest',
  'Count backwards from 10 with each exhale',
  'Close your eyes and focus on air entering',
  'Exhale longer than you inhale to calm down',
  'Place hand on heart, feel it slow down',
  'Breathe through your nose, out through mouth',
];

const SHIFT_FOCUS_BULLETS = [
  'Text or call someone you trust',
  'Watch or read something that inspires you',
  'Do anything that feeds your curiosity',
  'Start a conversation about anything else',
  'Listen to an energizing podcast',
  'Watch a documentary that interests you',
  'Read an article about your hobby',
  'Scroll through motivational content instead',
  'Play a game that requires full attention',
  'Start learning something new online',
];

const REMEMBER_WHY_BULLETS = [
  'Think about your goals and future self',
  'Remember why you decided to change',
  'Picture yourself calm, confident, in control',
  "Visualize how you'll feel tomorrow morning",
  "Think about the person you're becoming",
  'Remember the regret after last relapse',
  'List 3 reasons you started this journey',
  'Imagine telling your future self you won',
  'Think of someone you want to make proud',
  'Picture your best self , act like them now',
];

/**
 * Get random bullet points from a pool
 */
export function getRandomBulletPoints(pool: string[], count: number = 3): string[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'physical-reset',
    icon: '💪',
    title: 'Physical Reset',
    bulletPoints: getRandomBulletPoints(PHYSICAL_RESET_BULLETS),
    colorScheme: 'amber',
  },
  {
    id: 'breathe',
    icon: '🌬️',
    title: 'Breathe. For Real.',
    bulletPoints: getRandomBulletPoints(BREATHE_BULLETS),
    colorScheme: 'emerald',
  },
  {
    id: 'mental-distraction',
    icon: '🧘',
    title: 'Shift the Focus',
    bulletPoints: getRandomBulletPoints(SHIFT_FOCUS_BULLETS),
    colorScheme: 'cyan',
  },
  {
    id: 'remember-why',
    icon: '🎯',
    title: 'Remember Your Why',
    bulletPoints: getRandomBulletPoints(REMEMBER_WHY_BULLETS),
    colorScheme: 'blue',
  },
];

const REDIRECT_ENERGY_BULLETS = [
  'Tidy your room or do quick chores',
  'Play a short game or solve a challenge',
  'Create something , write, draw, build, code',
  'Organize your desk or closet',
  'Start a puzzle or brain teaser',
  'Build something with your hands',
  "Fix something that's been broken",
  'Plan your next day or week',
  'Sketch or doodle freely',
  'Rearrange your furniture',
];

const FUEL_BRAIN_BULLETS = [
  'Drink a glass of water slowly',
  'Eat fruits or nuts , something real, not processed',
  'Stretch or take a mindful pause',
  'Make yourself a healthy snack',
  'Have some dark chocolate mindfully',
  'Prepare a cup of tea or coffee',
  'Eat something crunchy like carrots',
  'Hydrate , your brain needs water',
  'Chew gum to redirect oral fixation',
  'Snack on seeds or dried fruit',
];

const WRITE_IT_OUT_BULLETS = [
  'Write what you feel , anger, boredom, shame, hope',
  "Don't edit. Don't judge. Just release.",
  "Revisit it later to see how far you've come",
  'Journal about what triggered this moment',
  'Write a letter to your future self',
  "List 5 things you're grateful for right now",
  "Describe the urge like you're observing it",
  'Write about who you want to become',
  'Make a list of your wins this week',
  'Scribble your thoughts , messy is fine',
];

const CHANGE_SOUNDTRACK_BULLETS = [
  'Play your power song , something that lifts you',
  'Move to the rhythm , even a head nod counts',
  'Let the music guide your mood to higher ground',
  'Listen to an upbeat playlist',
  'Sing along loudly , release the energy',
  'Play calming instrumental music',
  'Find a song that reminds you of strength',
  'Create a "resist urge" playlist',
  'Play nature sounds or white noise',
  'Listen to a motivational speech or podcast',
];

// Export bullet pools for use in components that need fresh random bullets
export const BULLET_POOLS: Record<string, string[]> = {
  'physical-reset': PHYSICAL_RESET_BULLETS,
  'breathe': BREATHE_BULLETS,
  'mental-distraction': SHIFT_FOCUS_BULLETS,
  'remember-why': REMEMBER_WHY_BULLETS,
  'redirect-energy': REDIRECT_ENERGY_BULLETS,
  'fuel-brain': FUEL_BRAIN_BULLETS,
  'write-it-out': WRITE_IT_OUT_BULLETS,
  'change-soundtrack': CHANGE_SOUNDTRACK_BULLETS,
};


export const EMERGENCY_ACTIONS: QuickAction[] = [
  ...QUICK_ACTIONS,
  {
    id: 'redirect-energy',
    icon: '🎮',
    title: 'Redirect the Energy',
    bulletPoints: getRandomBulletPoints(REDIRECT_ENERGY_BULLETS),
    colorScheme: 'purple',
  },
  {
    id: 'fuel-brain',
    icon: '🍎',
    title: 'Fuel Your Brain',
    bulletPoints: getRandomBulletPoints(FUEL_BRAIN_BULLETS),
    colorScheme: 'rose',
  },
  {
    id: 'write-it-out',
    icon: '📝',
    title: 'Write It Out',
    bulletPoints: getRandomBulletPoints(WRITE_IT_OUT_BULLETS),
    colorScheme: 'indigo',
  },
  {
    id: 'change-soundtrack',
    icon: '🎵',
    title: 'Change the Soundtrack',
    bulletPoints: getRandomBulletPoints(CHANGE_SOUNDTRACK_BULLETS),
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
  const categoryMap: Record<string, string | null> = {
    'physical-reset': '🏃 Physical',
    'breathe': '🧘 Mindfulness',
    'mental-distraction': null, // No pre-selection - general mental distraction
    'remember-why': '🧘 Mindfulness',
    'redirect-energy': '🎨 Creative',
    'fuel-brain': '🏃 Physical',
    'write-it-out': '🎨 Creative',
    'change-soundtrack': '✨ Other',
  };

  return categoryMap[actionId] || null;
}
