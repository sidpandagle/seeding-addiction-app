/**
 * Educational content for NoFap recovery journey
 * Research-based tips, motivational quotes, and progress insights
 * Used across Activity Modal, Relapse Modal, and educational sections
 */

export interface EducationalTip {
  id: string;
  title: string;
  content: string;
  type: 'activity' | 'relapse' | 'science' | 'progress';
  emoji?: string;
}

/**
 * Activity encouragement tips for Activity Modal
 */
export const ACTIVITY_TIPS: EducationalTip[] = [
  {
    id: 'a1',
    title: `You're Rewiring Your Brain`,
    content: `Each time you take a healthy action, you’re literally reshaping your brain. You’re proving that joy doesn’t come from quick hits, but from growth, connection, and effort. This is real neuroplasticity,your brain becoming stronger, more focused, more alive.`,
    type: 'activity',
    emoji: '🧠',
  },
  {
    id: 'a2',
    title: `Action Beats Urges`,
    content: `Urges can’t survive movement. When you act,create, move, connect,you starve the craving and feed purpose. Every step, rep, or message to a friend reminds your brain: “I lead. The urge follows.”`,
    type: 'activity',
    emoji: '💪',
  },
  {
    id: 'a3',
    title: `You're Building Identity`,
    content: `This isn’t about avoiding PMO,it’s about becoming someone new. Each decision to act shapes who you are becoming: the kind of person who trains, learns, connects, and creates. Your habits are building a legacy.`,
    type: 'activity',
    emoji: '🎯',
  },
  {
    id: 'a4',
    title: `Natural Dopamine Hits Different`,
    content: `Real dopamine isn’t cheap,it’s earned. Learning, creating, moving, connecting: these release the kind that heals you, not drains you. Each natural hit rewires your brain to love life’s real highs again.`,
    type: 'activity',
    emoji: '⚡',
  },
  {
    id: 'a5',
    title: `Energy Redirected = Power Gained`,
    content: `The same fire that once fueled old habits now builds your strength, focus, and ambition. Every workout, project, or moment of discipline proves that you can turn chaos into creation.`,
    type: 'activity',
    emoji: '🔥',
  },
  {
    id: 'a6',
    title: `You're Filling the Void Right`,
    content: `Boredom used to feed the cycle. Now, you fill that space with purpose,movement, art, laughter, growth. You’re not escaping anymore; you’re expanding. This is how peace replaces craving.`,
    type: 'activity',
    emoji: '✨',
  },
  {
    id: 'a7',
    title: `Consistency Compounds`,
    content: `Tiny wins stack up. One workout, one journal, one honest day,they add up like drops filling a bucket. A month from now, you won’t recognize who you were. Keep stacking those quiet victories.`,
    type: 'activity',
    emoji: '📈',
  },
  {
    id: 'a8',
    title: `You're Proving Self-Mastery`,
    content: `Every time you choose effort over escape, you prove you’re in command. You’re not avoiding pleasure,you’re upgrading it. This is what true freedom feels like: calm, focused power.`,
    type: 'activity',
    emoji: '👑',
  },
  {
    id: 'a9',
    title: `Real Life > Digital Life`,
    content: `Screens imitate connection. Reality *is* connection. Every time you walk outside, talk to a friend, or build something tangible, you feed your soul what pixels never could.`,
    type: 'activity',
    emoji: '🌍',
  },
  {
    id: 'a10',
    title: `This is How Legends Are Built`,
    content: `Great transformations aren’t explosions,they’re quiet repetitions. Every action you take is a brick in the fortress of your discipline. Keep going. You’re becoming the story you’ll tell someday.`,
    type: 'activity',
    emoji: '🚀',
  },
];

/**
 * Recovery and reframing tips for Relapse Modal
 * Focus: Honest about consequences, firm but supportive
 */
export const RELAPSE_RECOVERY_TIPS: EducationalTip[] = [
  {
    id: 'r1',
    title: `You're Cutting Down Your Plant`,
    content: `Every day clean was a seed taking root. Your plant was growing. Relapsing cuts it down,you return to the seed. But seeds can grow again. The real cost is the time, energy, and growth you're resetting. This is what you're losing.`,
    type: 'relapse',
    emoji: '🌱',
  },
  {
    id: 'r2',
    title: `Energy Depletion Is Real`,
    content: `Relapse drains your vital energy and crashes your dopamine. Your brain typically rebalances over 7–14 days, though recovery timelines vary. Every clean day you had built momentum. This sets you back. But you can rebuild,it just costs time.`,
    type: 'relapse',
    emoji: '⚡',
  },
  {
    id: 'r3',
    title: `This Choice Has Consequences`,
    content: `All the neural rewiring you've done is still there,but relapse weakens those pathways temporarily. You're not erasing progress, but you're hitting pause and moving backward. Think: Is this urge worth losing your plant?`,
    type: 'relapse',
    emoji: '⚠️',
  },
  {
    id: 'r4',
    title: `Your Streak Represents Real Growth`,
    content: `That counter you've built wasn't just a number,it's proof of your strength. Every day represented neurological rebuilding, dopamine healing, and willpower gains. Relapsing erases that visible progress. Know what you're giving up.`,
    type: 'relapse',
    emoji: '📊',
  },
  {
    id: 'r5',
    title: `The Urge Will Pass,If You Wait`,
    content: `Most urges peak and fade in 15–20 minutes. If you're feeling an urge right now, delay this decision. Walk away, breathe, shower, move. Save your plant. But if it already happened, log it honestly and learn from it.`,
    type: 'relapse',
    emoji: '⏰',
  },
  {
    id: 'r6',
    title: `Strength Is Built in Resistance`,
    content: `Every single time you resist an urge, your willpower strengthens. Every relapse weakens those rewired pathways. You're choosing between two paths: the one that builds you up or the one that pulls you down. What does growth demand?`,
    type: 'relapse',
    emoji: '💪',
  },
  {
    id: 'r7',
    title: `You Can Still Walk Away`,
    content: `If you haven't relapsed yet and you're thinking about logging,STOP. This is the moment of power. Don't give in to the craving. Your plant still stands. Prove to yourself that you lead the urge, not the other way around.`,
    type: 'relapse',
    emoji: '🚫',
  },
  {
    id: 'r8',
    title: `Rebuilding Is Possible, But Costly`,
    content: `Yes, you can recover from relapse. But understand: it typically takes 7–14 days to restabilize dopamine, though timelines vary. The neural pathways you built weaken but don't disappear. You're not starting from zero, but you are starting over. Make sure the cost was worth it.`,
    type: 'relapse',
    emoji: '🔧',
  },
];

/**
 * Science-based facts and insights
 */
export const SCIENCE_FACTS: EducationalTip[] = [
  {
    id: 's1',
    title: `The 7-Day Hormone Boost`,
    content: `After a week of discipline, some studies suggest testosterone levels may increase significantly (effects vary by individual). You might feel it as confidence, energy, and drive. Your biology is cheering you on.`,
    type: 'science',
    emoji: '🔬',
  },
  {
    id: 's2',
    title: `Neuroplasticity in Motion`,
    content: `In just two weeks, your brain starts rebuilding reward pathways. At 90 days, those connections become permanent. You’re literally upgrading your brain’s software.`,
    type: 'science',
    emoji: '🧬',
  },
  {
    id: 's3',
    title: `Dopamine Reset Effect`,
    content: `Overstimulation can significantly reduce dopamine receptor sensitivity (varies by individual). Abstaining lets them heal. It's like cleansing your taste buds,soon, real life will feel rich again.`,
    type: 'science',
    emoji: '🔋',
  },
  {
    id: 's4',
    title: `Your Prefrontal Powerhouse`,
    content: `This part of your brain controls focus, discipline, and willpower. Every urge you resist is like a mental push-up,it strengthens the control center that runs your entire life.`,
    type: 'science',
    emoji: '🎛️',
  },
];

/**
 * Progress milestones and timeline context
 */
export const PROGRESS_MILESTONES: EducationalTip[] = [
  {
    id: 'p1',
    title: `Days 1–7: The Awakening`,
    content: `Your mind clears, energy rises, and awareness sharpens. The fog starts lifting. You’re remembering what real focus feels like.`,
    type: 'progress',
    emoji: '🌅',
  },
  {
    id: 'p2',
    title: `Days 7–21: The Flatline`,
    content: `This is the renovation phase,low energy, doubts, mood swings. Don’t panic. It’s not failure, it’s rewiring. Stay grounded and trust the process.`,
    type: 'progress',
    emoji: '🔧',
  },
  {
    id: 'p3',
    title: `Days 21–90: The Rewiring`,
    content: `Clarity returns. Confidence grows. Life’s natural rewards start to feel good again. You’re syncing with real joy, not artificial spikes.`,
    type: 'progress',
    emoji: '⚙️',
  },
  {
    id: 'p4',
    title: `90+ Days: The New Normal`,
    content: `Urges fade. Focus feels natural. Self-control becomes instinct. You’re no longer “recovering”,you’re reborn.`,
    type: 'progress',
    emoji: '✨',
  },
];


/**
 * Get random tip by type
 */
export function getRandomTip(type: EducationalTip['type']): EducationalTip {
  const tips = {
    activity: ACTIVITY_TIPS,
    relapse: RELAPSE_RECOVERY_TIPS,
    science: SCIENCE_FACTS,
    progress: PROGRESS_MILESTONES,
  };

  const pool = tips[type];
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

// Play the Tape Forward - Visualize consequences
export const TAPE_FORWARD = {
  giveIn: [
    "The shame lasts hours",
    "The pleasure lasts seconds",
    "Tomorrow you'll feel worse, not better",
    "The guilt will steal your sleep tonight",
    "You'll feel drained, foggy, disappointed",
    "Every relapse makes the next urge stronger",
    "You're training your brain to seek quick fixes",
    "You'll reset the healing your brain has been doing",
    "You'll lose the mental clarity you've been building",
    "The dopamine crash will leave you emptier than before",
    "The temporary relief never solves the underlying problem",

    "You'll trade long-term peace for short-term escape",
    "The regret will hit harder than the urge ever did",
    "You'll feel weaker for not standing your ground",
    "You'll reinforce the habit you're trying to kill",
    "You'll numb yourself instead of fixing anything",
    "You'll look back at this moment with frustration",
    "You'll carry this disappointment into the next day",
    "You'll delay becoming the person you want to be",
  ],
  resist: [
    "Energy stays intact",
    "Tonight, you sleep with a clear conscience",
    "You prove you're in control",
    "Your brain chemistry continues healing",
    "You break the automatic response pattern",
    "Confidence compounds with each victory",
    "You'll wake up tomorrow feeling powerful",
    "You're building neural pathways for self-control",
    "Future you will be grateful for this moment",
    "Every 'no' makes the next one easier",

    "You keep the promise you made to yourself",
    "Discipline sharpens every time you choose restraint",
    "You walk away stronger than you were an hour ago",
    "You reclaim control over your impulses",
    "Your future urges lose power because of this choice",
    "You gain momentum instead of starting over",
    "Self-respect grows quietly but permanently",
    "You reinforce the identity of someone who resists",
    "This discomfort is temporary, strength is not",
    "You teach your brain patience over impulse",
    "You step closer to freedom from the habit",
    "You become harder to derail next time",
  ],
};

// Enhanced Physical Actions - Specific, immediate
export const PHYSICAL_SHOCK_ACTIONS = [
  { icon: "🧊", action: "Cold water on face/wrists (30 sec)" },
  { icon: "🏃", action: "10 burpees or jumping jacks" },
  { icon: "🚿", action: "Cold shower (even 30 sec works)" },
  { icon: "🫁", action: "Hold breath 30 sec, exhale slowly" },
  { icon: "✊", action: "Squeeze ice cubes until they melt" },
  { icon: "🧍", action: "Doorway press: push arms out hard" },
  { icon: "🎵", action: "Play loud music and dance for 60 sec" },
  { icon: "🌶️", action: "Eat something intensely spicy" },
  { icon: "🧘", action: "Do 10 deep squats slowly" },
  { icon: "📞", action: "Call or text someone right now" },
  { icon: "🚶", action: "Walk outside, change your environment" },
  { icon: "🗣️", action: "Say 'I am in control' out loud 5x" },
  { icon: "✍️", action: "Write 3 things you're grateful for" },
  { icon: "🪥", action: "Brush your teeth with cold water" },
];
