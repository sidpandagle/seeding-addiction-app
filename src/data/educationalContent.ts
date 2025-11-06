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
    content: `Each time you take a healthy action, you’re literally reshaping your brain. You’re proving that joy doesn’t come from quick hits, but from growth, connection, and effort. This is real neuroplasticity—your brain becoming stronger, more focused, more alive.`,
    type: 'activity',
    emoji: '🧠',
  },
  {
    id: 'a2',
    title: `Action Beats Urges`,
    content: `Urges can’t survive movement. When you act—create, move, connect—you starve the craving and feed purpose. Every step, rep, or message to a friend reminds your brain: “I lead. The urge follows.”`,
    type: 'activity',
    emoji: '💪',
  },
  {
    id: 'a3',
    title: `You're Building Identity`,
    content: `This isn’t about avoiding PMO—it’s about becoming someone new. Each decision to act shapes who you are becoming: the kind of person who trains, learns, connects, and creates. Your habits are building a legacy.`,
    type: 'activity',
    emoji: '🎯',
  },
  {
    id: 'a4',
    title: `Natural Dopamine Hits Different`,
    content: `Real dopamine isn’t cheap—it’s earned. Learning, creating, moving, connecting: these release the kind that heals you, not drains you. Each natural hit rewires your brain to love life’s real highs again.`,
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
    content: `Boredom used to feed the cycle. Now, you fill that space with purpose—movement, art, laughter, growth. You’re not escaping anymore; you’re expanding. This is how peace replaces craving.`,
    type: 'activity',
    emoji: '✨',
  },
  {
    id: 'a7',
    title: `Consistency Compounds`,
    content: `Tiny wins stack up. One workout, one journal, one honest day—they add up like drops filling a bucket. A month from now, you won’t recognize who you were. Keep stacking those quiet victories.`,
    type: 'activity',
    emoji: '📈',
  },
  {
    id: 'a8',
    title: `You're Proving Self-Mastery`,
    content: `Every time you choose effort over escape, you prove you’re in command. You’re not avoiding pleasure—you’re upgrading it. This is what true freedom feels like: calm, focused power.`,
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
    content: `Great transformations aren’t explosions—they’re quiet repetitions. Every action you take is a brick in the fortress of your discipline. Keep going. You’re becoming the story you’ll tell someday.`,
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
    content: `Every day clean was a seed taking root. Your plant was growing. Relapsing cuts it down—you return to the seed. But seeds can grow again. The real cost is the time, energy, and growth you're resetting. This is what you're losing.`,
    type: 'relapse',
    emoji: '🌱',
  },
  {
    id: 'r2',
    title: `Energy Depletion Is Real`,
    content: `Relapse drains your vital energy and crashes your dopamine. Your brain will be in a storm for 7–14 days as it rebalances. Every clean day you had built momentum. This sets you back. But you can rebuild—it just costs time.`,
    type: 'relapse',
    emoji: '⚡',
  },
  {
    id: 'r3',
    title: `This Choice Has Consequences`,
    content: `All the neural rewiring you've done is still there—but relapse weakens those pathways temporarily. You're not erasing progress, but you're hitting pause and moving backward. Think: Is this urge worth losing your plant?`,
    type: 'relapse',
    emoji: '⚠️',
  },
  {
    id: 'r4',
    title: `Your Streak Represents Real Growth`,
    content: `That counter you've built wasn't just a number—it's proof of your strength. Every day represented neurological rebuilding, dopamine healing, and willpower gains. Relapsing erases that visible progress. Know what you're giving up.`,
    type: 'relapse',
    emoji: '📊',
  },
  {
    id: 'r5',
    title: `The Urge Will Pass—If You Wait`,
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
    content: `If you haven't relapsed yet and you're thinking about logging—STOP. This is the moment of power. Don't give in to the craving. Your plant still stands. Prove to yourself that you lead the urge, not the other way around.`,
    type: 'relapse',
    emoji: '🚫',
  },
  {
    id: 'r8',
    title: `Rebuilding Is Possible, But Costly`,
    content: `Yes, you can recover from relapse. But understand: it takes 7–14 days to restabilize dopamine. The neural pathways you built weaken but don't disappear. You're not starting from zero, but you are starting over. Make sure the cost was worth it.`,
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
    content: `After a week of discipline, studies show testosterone can rise up to 145%. You’ll feel it as confidence, energy, and drive. Your biology is cheering you on.`,
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
    content: `Overstimulation dulls dopamine receptors by up to 50%. Abstaining lets them heal. It’s like cleansing your taste buds—soon, real life will feel rich again.`,
    type: 'science',
    emoji: '🔋',
  },
  {
    id: 's4',
    title: `Your Prefrontal Powerhouse`,
    content: `This part of your brain controls focus, discipline, and willpower. Every urge you resist is like a mental push-up—it strengthens the control center that runs your entire life.`,
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
    content: `This is the renovation phase—low energy, doubts, mood swings. Don’t panic. It’s not failure, it’s rewiring. Stay grounded and trust the process.`,
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
    content: `Urges fade. Focus feels natural. Self-control becomes instinct. You’re no longer “recovering”—you’re reborn.`,
    type: 'progress',
    emoji: '✨',
  },
];

/**
 * Historical figures who conquered lust and addiction
 */
export const GREAT_MEN_WISDOM = [
  {
    id: 'gm1',
    name: 'Marcus Aurelius',
    title: 'Roman Emperor & Stoic',
    wisdom: `“You have power over your mind — not outside events. Realize this, and you will find strength.”` ,
    lesson: `As emperor of Rome, Marcus Aurelius faced wars, plagues and palace intrigues, yet his writings in the Meditations show he saw true sovereignty as internal. He taught that conquering your own mind is more potent than conquering kingdoms.` ,
  },
  {
    id: 'gm2',
    name: 'Seneca',
    title: 'Philosopher & Statesman',
    wisdom: `“It is in no man’s power to have whatever he wants, but it is in his power not to want what he hasn’t got, and to make use of what he does have.”` ,
    lesson: `Seneca lived amid Roman opulence and political danger yet insisted that real freedom lies in mastering desire. By choosing what not to want, he showed that wealth and peace don’t come from more—but from less greed and more mastery of wants.` ,
  },
  {
    id: 'gm3',
    name: 'Epictetus',
    title: 'Former Slave, Stoic Master',
    wisdom: `“Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control.”` ,
    lesson: `Born into slavery and then freed, Epictetus taught that though we cannot control externals, we can govern our responses. He lived what he taught: true freedom comes when you stop chasing what you can’t change and instead master your inner world.` ,
  },
  {
    id: 'gm4',
    name: 'Nikola Tesla',
    title: 'Inventor & Visionary',
    wisdom: `“I do not think you can name many great inventions that have been made by married men.”` ,  // Note: Attribution debated
    lesson: `Tesla believed his mental energy and creativity required intense discipline and focus. Whether or not the quote is exact, his life shows he treated his ideas like currents to be directed, not dissipated. His celibacy and isolation were part of his strategy to turn inner reserves into outer breakthroughs.` ,
  },
  {
    id: 'gm5',
    name: 'Mike Tyson',
    title: 'Boxer & Comeback Story',
    wisdom: `“Discipline is doing what you hate to do, but doing it like you love it.”` ,
    lesson: `Tyson’s quote captures the brutal truth of high-level training: it’s not about motivation, it’s about choosing to do the hard things. In his camps, abstaining from distractions, he turned willpower into preparation—and preparation into performance.` ,
  },
  {
    id: 'gm6',
    name: 'Leonardo da Vinci',
    title: 'Renaissance Polymath',
    wisdom: `“The noblest pleasure is the joy of understanding.”` ,
    lesson: `Leonardo didn’t chase only beauty—he chased comprehension. His notebooks are full of observations, sketches and experiments. By converting curiosity into creation, he transformed withheld impulse into lasting innovation rather than fleeting indulgence.` ,
  },
  {
    id: 'gm7',
    name: 'Bruce Lee',
    title: 'Martial Artist & Philosopher',
    wisdom: `“Be master of yourself rather than mastered by your desires.”` ,  // paraphrase based on his teachings
    lesson: `Lee trained not just his body but his mind. His preparation and philosophical writings show he saw most conflicts as internal. By recognising desire as an opponent, he made his calmness and precision his greatest weapons.` ,
  },
  {
    id: 'gm8',
    name: 'Swami Vivekananda',
    title: 'Monk & Philosopher',
    wisdom: `“Chastity is the corner-stone of all morality and of all great achievements.”` ,
    lesson: `Vivekananda lived a life of austerity in service of spiritual and social goals. He preached redirecting personal energy into purpose. His example suggests that virtue isn’t about denial of life, but transformation of energy from the private to the profound.` ,
  },
  {
    id: 'gm9',
    name: 'Socrates',
    title: 'Greek Philosopher',
    wisdom: `“He who is not contented with what he has would not be contented with what he would like to have.”` ,
    lesson: `Socrates argued—and lived—by questioning assumptions and simplifying life. He wielded his limited means to pursue truth, showing that the fewer things you depend on, the freer and more powerful you become.` ,
  },
  {
    id: 'gm10',
    name: 'David Goggins',
    title: 'Navy SEAL & Endurance Athlete',
    wisdom: `“Motivation is crap. Discipline is everything.”` ,
    lesson: `Goggins turned himself from police-athlete to ultra-endurance icon by embracing pain and rejecting comfort. For him, urges are lies waiting to be obeyed—discipline is the truth that sets you free. Master the moment, master yourself.` ,
  },
  {
    id: 'gm11',
    name: 'Jordan Peterson',
    title: 'Psychologist & Author',
    wisdom: `“You must determine where you are going, so that you can bargain for yourself properly.”` ,
    lesson: `Peterson warns that without structure, desires become chaos. He teaches that knowing your destination gives meaning to discipline. Unbridled lust or indulgence isn’t freedom—it’s surrender. Clarity of aim gives power to restraint.` ,
  },
  {
    id: 'gm12',
    name: 'Jocko Willink',
    title: 'Navy SEAL Commander & Author',
    wisdom: `“Discipline equals freedom.”` ,
    lesson: `Willink lives by the paradox: the tighter the control you exert on your inner world, the more room you create in outer life. He wakes early, trains hard, and obeys his mission—and by mastering those small choices, he wins the bigger ones.` ,
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

/**
 * Get random great man wisdom
 */
export function getRandomGreatMan() {
  const randomIndex = Math.floor(Math.random() * GREAT_MEN_WISDOM.length);
  return GREAT_MEN_WISDOM[randomIndex];
}
