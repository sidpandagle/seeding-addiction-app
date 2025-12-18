/**
 * Mock Subscription Plans Configuration
 *
 * This file defines the available subscription plans for testing/development.
 * When RevenueCat is integrated, these will be replaced with actual offerings.
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  period: 'weekly' | 'monthly' | 'yearly' | 'lifetime';
  periodLabel: string;
  savings?: string;
  popular?: boolean;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'seeding_pro_weekly',
    name: 'Weekly',
    description: 'Try Pro for a week',
    price: '$1.99',
    priceValue: 1.99,
    period: 'weekly',
    periodLabel: 'per week',
    features: [
      'Advanced Insights & Analytics',
      'Export to CSV',
      'Share Report for Therapy',
      'Streak Heatmap',
      'Milestone Predictions',
    ],
  },
  {
    id: 'seeding_pro_monthly',
    name: 'Monthly',
    description: 'Most flexible option',
    price: '$4.99',
    priceValue: 4.99,
    period: 'monthly',
    periodLabel: 'per month',
    popular: true,
    features: [
      'Advanced Insights & Analytics',
      'Export to CSV',
      'Share Report for Therapy',
      'Streak Heatmap',
      'Milestone Predictions',
    ],
  },
  {
    id: 'seeding_pro_yearly',
    name: 'Yearly',
    description: 'Best value',
    price: '$29.99',
    priceValue: 29.99,
    period: 'yearly',
    periodLabel: 'per year',
    savings: 'Save 50%',
    features: [
      'Advanced Insights & Analytics',
      'Export to CSV',
      'Share Report for Therapy',
      'Streak Heatmap',
      'Milestone Predictions',
      'Priority Support',
    ],
  },
  {
    id: 'seeding_pro_lifetime',
    name: 'Lifetime',
    description: 'One-time purchase',
    price: '$49.99',
    priceValue: 49.99,
    period: 'lifetime',
    periodLabel: 'one time',
    savings: 'Best Deal',
    features: [
      'Advanced Insights & Analytics',
      'Export to CSV',
      'Share Report for Therapy',
      'Streak Heatmap',
      'Milestone Predictions',
      'Priority Support',
      'All Future Updates',
    ],
  },
];

export const PREMIUM_FEATURES = [
  {
    icon: 'BarChart3',
    title: 'Advanced Insights',
    description: 'Deep analytics and patterns from your journey',
  },
  {
    icon: 'Download',
    title: 'Export Data',
    description: 'Export your data to CSV for backup or analysis',
  },
  {
    icon: 'FileText',
    title: 'Therapy Reports',
    description: 'Generate formatted reports to share with professionals',
  },
  {
    icon: 'Calendar',
    title: 'Streak Heatmap',
    description: 'Visual calendar showing your progress over time',
  },
  {
    icon: 'TrendingUp',
    title: 'Milestone Predictions',
    description: 'AI-powered predictions for your next milestones',
  },
];
