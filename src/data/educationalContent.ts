/**
 * Educational content for NoFap recovery journey
 * Research-based tips, motivational quotes, and progress insights
 * Used across Activity Modal, Relapse Modal, and educational sections
 */

export interface EducationalTip {
  id: string;
  title: string;
  content: string;
  type: 'activity' | 'relapse' | 'science' | 'humor' | 'progress';
  emoji?: string;
}

/**
 * Activity encouragement tips for Activity Modal
 */
export const ACTIVITY_TIPS: EducationalTip[] = [
  {
    id: 'a1',
    title: `You're Rewiring Your Brain`,
    content: `Every positive action you take strengthens healthy neural pathways. You're teaching your brain that real joy comes from effort, connection, and growth—not cheap dopamine hits. This is neuroplasticity in action.`,
    type: 'activity',
    emoji: '🧠',
  },
  {
    id: 'a2',
    title: `Action Beats Urges`,
    content: `Every time you engage in a healthy activity, you're not just distracting yourself—you're redirecting your energy toward something meaningful. Movement, creation, and connection are the antidotes to temptation.`,
    type: 'activity',
    emoji: '💪',
  },
  {
    id: 'a3',
    title: `You're Building Identity`,
    content: `Each action defines who you're becoming. You're not just "avoiding PMO"—you're becoming someone who works out, creates, connects, and grows. Identity follows action, not the other way around.`,
    type: 'activity',
    emoji: '🎯',
  },
  {
    id: 'a4',
    title: `Natural Dopamine is Better`,
    content: `Physical activity, learning, creativity, and social connection all release dopamine—but the healthy kind. Your brain's reward system is healing, and these activities are teaching it what real satisfaction feels like.`,
    type: 'activity',
    emoji: '⚡',
  },
  {
    id: 'a5',
    title: `Energy Redirected is Power Gained`,
    content: `The same energy that used to fuel compulsive behavior is now building your future. Every workout, conversation, project, or walk is proof that you control where your power goes.`,
    type: 'activity',
    emoji: '🔥',
  },
  {
    id: 'a6',
    title: `You're Filling the Void Right`,
    content: `Addiction thrives in boredom and emptiness. By actively engaging in life—whether through exercise, art, or connection—you're starving the urge and feeding your growth. This is how you win.`,
    type: 'activity',
    emoji: '✨',
  },
  {
    id: 'a7',
    title: `Consistency Compounds`,
    content: `One workout, one creative session, one social hangout might seem small. But stack them over weeks and months, and you'll look back shocked at how far you've come. Small actions, massive results.`,
    type: 'activity',
    emoji: '📈',
  },
  {
    id: 'a8',
    title: `You're Proving Self-Governance`,
    content: `Every time you choose action over avoidance, effort over escape, you're demonstrating that you run your life—not your impulses. This is freedom. This is mastery.`,
    type: 'activity',
    emoji: '👑',
  },
  {
    id: 'a9',
    title: `Real Life > Digital Life`,
    content: `Screens offer fake rewards. Real activities—movement, nature, people, creation—offer genuine satisfaction. The more you engage with reality, the less appealing the fake stuff becomes.`,
    type: 'activity',
    emoji: '🌍',
  },
  {
    id: 'a10',
    title: `This is How Legends are Built`,
    content: `Every great transformation started with simple, repeated actions. You're not just logging an activity—you're laying the foundation for the person you're meant to be. Keep stacking wins.`,
    type: 'activity',
    emoji: '🚀',
  },
];

/**
 * Recovery and reframing tips for Relapse Modal
 */
export const RELAPSE_RECOVERY_TIPS: EducationalTip[] = [
  {
    id: 'r1',
    title: `This Isn't Failure, It's Data`,
    content: `Seriously. What triggered it? What time of day? What emotion? You just collected valuable intel. Scientists call this "learning." You're basically doing field research on yourself.`,
    type: 'relapse',
    emoji: '📊',
  },
  {
    id: 'r2',
    title: `The 85% → 15% Journey`,
    content: `Year 1 recovery: 85% relapse rate. Year 5: drops to 15%. You're not broken—you're in the statistically normal part of recovery. The only failure is quitting the journey.`,
    type: 'relapse',
    emoji: '📉',
  },
  {
    id: 'r3',
    title: `Progress Over Perfection`,
    content: `Went from weekly to monthly relapses? That's 75% improvement. From daily to weekly? That's 85% better. The trend matters more than the slip-ups.`,
    type: 'relapse',
    emoji: '📈',
  },
  {
    id: 'r4',
    title: `The Streak Paradox`,
    content: `A 90-day streak with one relapse is infinitely better than giving up. Your brain doesn't reset to day zero—it remembers all that neuroplasticity work. You're still ahead.`,
    type: 'relapse',
    emoji: '🔄',
  },
  {
    id: 'r5',
    title: `Even Seneca Had Bad Days`,
    content: `Stoic philosophers weren't perfect—they just kept recommitting to their principles. Marcus Aurelius wrote "Meditations" to remind himself to stay on track. You're in good company.`,
    type: 'relapse',
    emoji: '📜',
  },
  {
    id: 'r6',
    title: `The Shame Spiral Trap`,
    content: `Research shows shame increases relapse rates by 340%. Self-compassion, however, increases recovery success. Be kind to yourself—science says it works better than beating yourself up.`,
    type: 'relapse',
    emoji: '💚',
  },
  {
    id: 'r7',
    title: `Your Brain Needs 48-72 Hours`,
    content: `Post-relapse guilt peaks in the first 2-3 days, then drops significantly. Ride it out. The neurochemical storm will pass, and clarity returns. Just keep breathing.`,
    type: 'relapse',
    emoji: '🌊',
  },
  {
    id: 'r8',
    title: `The Dopamine Rebound`,
    content: `Your brain's reward system recalibrates within 4-7 days of getting back on track. It's not about perfection—it's about getting back up fast and staying consistent.`,
    type: 'relapse',
    emoji: '🎢',
  },
];

/**
 * Science-based facts and insights
 */
export const SCIENCE_FACTS: EducationalTip[] = [
  {
    id: 's1',
    title: `The 7-Day Testosterone Peak`,
    content: `Studies show testosterone spikes by 145% after 7 days of abstinence, then stabilizes. Your body is literally rewarding your self-control with more energy and confidence.`,
    type: 'science',
    emoji: '🔬',
  },
  {
    id: 's2',
    title: `Neuroplasticity Timeline`,
    content: `Your brain's reward pathways start rewiring within 14 days. By 90 days, significant structural changes occur. By 6 months, you're running on upgraded hardware.`,
    type: 'science',
    emoji: '🧬',
  },
  {
    id: 's3',
    title: `The Dopamine Sensitivity Effect`,
    content: `Chronic overstimulation desensitizes dopamine receptors by up to 50%. Abstinence allows them to regenerate. Think of it as letting your taste buds reset after eating too much sugar.`,
    type: 'science',
    emoji: '🔋',
  },
  {
    id: 's4',
    title: `Prefrontal Cortex = Your Superpower`,
    content: `This brain region handles impulse control, decision-making, and willpower. Every urge you resist strengthens it. You're literally building a stronger command center.`,
    type: 'science',
    emoji: '🎛️',
  },
];

/**
 * Humorous motivational content
 */
export const HUMOR_MOTIVATION: EducationalTip[] = [
  {
    id: 'h1',
    title: `Your Brain: "Wait, What?"`,
    content: `Limbic system: "Let's do the thing!"\nPrefrontal cortex: "Nah."\nLimbic system: "...you can do that?"\nYou: "Apparently."`,
    type: 'humor',
    emoji: '😅',
  },
  {
    id: 'h2',
    title: `The Urge's Resume`,
    content: `Skills: Making big promises. Breaking all of them. Delivering regret. Proficiency in guilt-tripping. Yeah, you're not hiring this candidate.`,
    type: 'humor',
    emoji: '📋',
  },
  {
    id: 'h3',
    title: `Urge vs. You`,
    content: `Urge: "I'll make you feel amazing!"\nYou: "You're literally just chemicals firing randomly."\nUrge: "...okay but—"\nYou: "No."\nUrge: *surprised Pikachu face*`,
    type: 'humor',
    emoji: '⚔️',
  },
  {
    id: 'h4',
    title: `Achievement Unlocked`,
    content: `🏆 "Told My Brain 'No' and Lived to Tell the Tale" — Rarity: Legendary. Effect: +10 Self-Respect, +5 Willpower, Permanent Flex.`,
    type: 'humor',
    emoji: '🏆',
  },
];

/**
 * Progress milestones and timeline context
 */
export const PROGRESS_MILESTONES: EducationalTip[] = [
  {
    id: 'p1',
    title: `Days 1-7: The Awakening`,
    content: `Energy spikes, brain fog lifts, motivation surges. This is your system purging cheap dopamine and remembering what "normal" feels like.`,
    type: 'progress',
    emoji: '🌅',
  },
  {
    id: 'p2',
    title: `Days 7-21: The Flatline`,
    content: `Low motivation, mood dips, doubt creeps in. This is normal—your brain is recalibrating. It's not regression, it's renovation. Keep going.`,
    type: 'progress',
    emoji: '🔧',
  },
  {
    id: 'p3',
    title: `Days 21-90: The Rewiring`,
    content: `Clarity returns, confidence builds, natural rewards feel satisfying again. Your reward system is officially back online. You're running on premium fuel now.`,
    type: 'progress',
    emoji: '⚙️',
  },
  {
    id: 'p4',
    title: `90+ Days: The New Normal`,
    content: `Urges are rare and weak. Self-control feels automatic. You're not "recovering" anymore—you're living upgraded. This is the destination.`,
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
    wisdom: `Practiced strict self-discipline despite absolute power. Wrote in Meditations: "You have power over your mind—not outside events."`,
    lesson: `Surrounded by luxury, temptation, and endless indulgence, he still lived like a monk in a palace. Marcus proved that true kings don't conquer lands — they conquer themselves. His restraint was his crown.`,
  },
  {
    id: 'gm2',
    name: 'Seneca',
    title: 'Philosopher & Statesman',
    wisdom: `Taught temperance as the foundation of freedom. "No person has power to have everything they want, but it is in their power not to want what they don't have."`,
    lesson: `Seneca lived in Rome's age of excess but saw through it all. He understood that desire, when left unchecked, becomes your master. By mastering himself, he achieved the one thing money couldn't buy — peace.`,
  },
  {
    id: 'gm3',
    name: 'Epictetus',
    title: 'Former Slave, Stoic Master',
    wisdom: 'Rose from slavery to philosophy through radical self-discipline. "Freedom is the only worthy goal in life. It is won by disregarding things beyond our control."',
    lesson: 'He had no wealth, no comfort, and no freedom — except the one inside his mind. By refusing to bow to impulse or lust, Epictetus proved that even a slave can be freer than kings if he rules himself.',
  },
  {
    id: 'gm4',
    name: 'Nikola Tesla',
    title: 'Inventor & Visionary',
    wisdom: `Attributed his extraordinary creativity and productivity to celibacy and mental discipline. "I do not think you can name many great inventions that have been made by married men."`,
    lesson: `Tesla treated sexual energy as divine current — something to be directed, not drained. He turned human desire into innovation, lighting up cities instead of wasting sparks in the dark. His celibacy wasn't repression — it was transformation.`,
  },
  {
    id: 'gm5',
    name: 'Mike Tyson',
    title: 'Boxer & Comeback Story',
    wisdom: 'Abstained from sex during training camps to maintain aggression and focus. "Discipline is doing what you hate to do, but nonetheless doing it like you love it."',
    lesson: 'Tyson understood that lust weakens warriors. By restraining himself, he sharpened his instincts and fed his inner beast the right way — with hunger, not indulgence. His control made him a predator in the ring and a student of life outside it.',
  },
  {
    id: 'gm6',
    name: 'Leonardo da Vinci',
    title: 'Renaissance Polymath',
    wisdom: 'Known for chastity and transmuting desire into art and discovery. "The noblest pleasure is the joy of understanding."',
    lesson: `Leonardo's genius wasn't just talent — it was discipline disguised as curiosity. While others chased pleasure, he chased purpose. Every ounce of energy he withheld from indulgence became fuel for creation that still moves the world centuries later.`,
  },
  {
    id: 'gm7',
    name: 'Bruce Lee',
    title: 'Martial Artist & Philosopher',
    wisdom: 'Believed mastery begins with self-control. "Be master of yourself rather than mastered by your desires."',
    lesson: 'Bruce Lee trained his body to obey his mind — not the other way around. He saw lust and laziness as opponents no different from those in combat. By conquering them daily, he achieved not just power, but presence. His calm was his strength.',
  },
  {
    id: 'gm8',
    name: 'Swami Vivekananda',
    title: 'Monk & Philosopher',
    wisdom: '"Chastity is the corner-stone of all morality and of all great achievements." Believed purity of thought and restraint of senses were foundations of greatness.',
    lesson: `Vivekananda turned sexual energy into spiritual voltage. He showed that willpower, when undivided, becomes the most potent force on Earth. He didn't escape desire — he sublimated it into purpose, passion, and power.`,
  },
  {
    id: 'gm9',
    name: 'Socrates',
    title: 'Greek Philosopher',
    wisdom: 'Lived with simplicity and reason. "He who is not contented with what he has would not be contented with what he would like to have."',
    lesson: 'Socrates proved that pleasure fades but wisdom endures. He trained his mind to question impulses, not obey them. By keeping his desires small, he made his peace enormous — a reminder that true satisfaction comes from within.',
  },
  {
    id: 'gm10',
    name: 'David Goggins',
    title: 'Navy SEAL & Endurance Athlete',
    wisdom: 'Preaches calloused minds and absolute control over urges. "Motivation is crap. Discipline is everything."',
    lesson: 'Goggins was once broken by weakness and addiction, but he rebuilt himself with relentless discipline. He doesn’t escape pain — he hunts it. His message: your urges will lie to you, your discipline never will. Master the moment, master yourself.',
  },
  {
    id: 'gm11',
    name: 'Jordan Peterson',
    title: 'Psychologist & Author',
    wisdom: 'Advocates for responsibility, order, and taming of chaos. "You must determine where you are going, so that you can bargain for yourself properly."',
    lesson: `Peterson warns that indulgence without direction leads to decay. He teaches that by aiming high and delaying gratification, you bring structure to chaos. Lust, when mastered, becomes ambition; when unrestrained, it destroys potential.`,
  },
  {
    id: 'gm12',
    name: 'Jocko Willink',
    title: 'Navy SEAL Commander & Author',
    wisdom: '"Discipline equals freedom." Lived by military precision and self-mastery to achieve control over mind and mission.',
    lesson: `Jocko doesn't negotiate with temptation. He wakes before dawn, trains before excuses, and acts before desire speaks. His philosophy: the more control you gain over yourself, the freer you become — because weakness obeys, but discipline commands.`,
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
    humor: HUMOR_MOTIVATION,
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
