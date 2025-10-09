export interface StoicTeaching {
  id: string;
  quote: string;
  author: string;
  explanation: string;
  category: 'control' | 'discipline' | 'resilience' | 'wisdom' | 'virtue';
}

export const stoicTeachings: StoicTeaching[] = [
  {
    id: '1',
    quote: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
    author: 'Marcus Aurelius',
    explanation: 'This moment is just a thought, an urge - it has no power over you unless you give it power. Your mind is yours to command.',
    category: 'control',
  },
  {
    id: '2',
    quote: 'No person has the power to have everything they want, but it is in their power not to want what they don\'t have.',
    author: 'Seneca',
    explanation: 'The urge promises pleasure, but you can choose not to desire it. True freedom is in controlling your wants, not satisfying every impulse.',
    category: 'discipline',
  },
  {
    id: '3',
    quote: 'The happiness of your life depends upon the quality of your thoughts.',
    author: 'Marcus Aurelius',
    explanation: 'Right now, redirect your thoughts. Think about your goals, your values, the person you want to become. The urge is temporary; your character is permanent.',
    category: 'wisdom',
  },
  {
    id: '4',
    quote: 'He who is brave is free.',
    author: 'Seneca',
    explanation: 'It takes courage to resist an urge. But in that resistance, you find true freedom. Bravery isn\'t the absence of temptation - it\'s acting right despite it.',
    category: 'virtue',
  },
  {
    id: '5',
    quote: 'The obstacle is the way.',
    author: 'Marcus Aurelius',
    explanation: 'This urge you\'re facing? It\'s not blocking your path - it IS the path. Overcoming it is how you grow stronger. Every "no" to an urge is a "yes" to yourself.',
    category: 'resilience',
  },
  {
    id: '6',
    quote: 'If it is not right, do not do it. If it is not true, do not say it.',
    author: 'Marcus Aurelius',
    explanation: 'Simple. Direct. Ask yourself: Is giving in right? Does it align with who you want to be? You already know the answer.',
    category: 'virtue',
  },
  {
    id: '7',
    quote: 'First say to yourself what you would be; and then do what you have to do.',
    author: 'Epictetus',
    explanation: 'Who do you want to be? Someone who controls themselves or someone controlled by urges? Define yourself, then act accordingly.',
    category: 'wisdom',
  },
  {
    id: '8',
    quote: 'Wealth consists not in having great possessions, but in having few wants.',
    author: 'Epictetus',
    explanation: 'You\'re richer when you want less. Resist this urge, and you\'re wealthy in self-control. Give in, and you remain poor in discipline.',
    category: 'discipline',
  },
  {
    id: '9',
    quote: 'The best revenge is not to be like your enemy.',
    author: 'Marcus Aurelius',
    explanation: 'Your urges are the enemy trying to control you. The best way to win? Don\'t become a slave to them. Stay free. Stay in control.',
    category: 'control',
  },
  {
    id: '10',
    quote: 'How long are you going to wait before you demand the best for yourself?',
    author: 'Epictetus',
    explanation: 'Stop waiting. You deserve better than this urge. You deserve self-respect, strength, freedom. Demand it from yourself RIGHT NOW.',
    category: 'resilience',
  },
  {
    id: '11',
    quote: 'We suffer more often in imagination than in reality.',
    author: 'Seneca',
    explanation: 'The urge makes promises - pleasure, relief, satisfaction. But these are imagined. The reality? Regret, shame, starting over. Don\'t be fooled.',
    category: 'wisdom',
  },
  {
    id: '12',
    quote: 'Difficulties strengthen the mind, as labor does the body.',
    author: 'Seneca',
    explanation: 'This is your training ground. Every urge you resist makes your mind stronger. You\'re not just avoiding a relapse - you\'re building unshakeable willpower.',
    category: 'resilience',
  },
  {
    id: '13',
    quote: 'The soul becomes dyed with the color of its thoughts.',
    author: 'Marcus Aurelius',
    explanation: 'Feed your mind with thoughts of strength, not weakness. Think of victory, not defeat. Your thoughts right now are shaping who you become.',
    category: 'wisdom',
  },
  {
    id: '14',
    quote: 'Man is disturbed not by things, but by the views he takes of them.',
    author: 'Epictetus',
    explanation: 'This urge is just a sensation. It\'s your interpretation that gives it power. See it as temporary discomfort, not an order you must obey.',
    category: 'control',
  },
  {
    id: '15',
    quote: 'Associate with people who are likely to improve you.',
    author: 'Seneca',
    explanation: 'Right now, reach out to someone who supports your journey. Text a friend. Call someone. Don\'t face this alone.',
    category: 'wisdom',
  },
];

export const getRandomTeaching = (): StoicTeaching => {
  const randomIndex = Math.floor(Math.random() * stoicTeachings.length);
  return stoicTeachings[randomIndex];
};

export const getTeachingsByCategory = (category: StoicTeaching['category']): StoicTeaching[] => {
  return stoicTeachings.filter((teaching) => teaching.category === category);
};
