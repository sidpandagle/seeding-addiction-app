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
    name: 'Weekly Pass', // Changed for commitment/action
    description: 'Quick trial access', // Clearer intent
    price: '$1.99',
    priceValue: 1.99,
    period: 'weekly',
    periodLabel: 'per week',
    features: [
      'Comprehensive Journey Analytics',
      'Detailed Progress Tracking',
      'CSV Data Export',
      'Professional Therapy Reports',
      'Trend Analysis & Insights',
      'Ad-Free Experience',
    ],
  },
  {
    id: 'seeding_pro_monthly',
    name: 'Monthly Pro',
    description: 'Perfect for ongoing recovery',
    price: '$4.99',
    priceValue: 4.99,
    period: 'monthly',
    periodLabel: 'per month',
    popular: true,
    features: [
      'Comprehensive Journey Analytics',
      'Detailed Progress Tracking',
      'CSV Data Export',
      'Professional Therapy Reports',
      'Trend Analysis & Insights',
      'Smart Milestone Predictions',
      'Ad-Free Experience',
    ],
  },
  {
    id: 'seeding_pro_yearly',
    name: 'Annual Saver', // Changed for value
    description: 'Commit to long-term growth (Best Value)', // Emphasizing commitment
    price: '$29.99',
    priceValue: 29.99,
    period: 'yearly',
    periodLabel: 'per year',
    savings: 'SAVE 50%',
    features: [
      'Comprehensive Journey Analytics',
      'Detailed Progress Tracking',
      'CSV Data Export',
      'Professional Therapy Reports',
      'Trend Analysis & Insights',
      'Smart Milestone Predictions',
      'Ad-Free Experience',
    ],
  },
  {
    id: 'seeding_pro_lifetime',
    name: 'Lifetime Access', // Changed for clarity
    description: 'Pay once, never subscribe again',
    price: '$99.99',
    priceValue: 99.99,
    period: 'lifetime',
    periodLabel: 'one-time payment',
    savings: 'Forever Deal', // More compelling than "Best Deal" here
    features: [
      'Comprehensive Journey Analytics',
      'Detailed Progress Tracking',
      'CSV Data Export',
      'Professional Therapy Reports',
      'Trend Analysis & Insights',
      'Smart Milestone Predictions',
      'Ad-Free Experience',
      'All Future Updates Forever',
      'Lifetime Feature Access',
    ],
  },
];

export const PREMIUM_FEATURES = [
  {
    icon: 'BarChart3',
    title: 'Comprehensive Analytics',
    description: 'Deep insights into your recovery patterns and behavioral trends',
  },
  {
    icon: 'Download',
    title: 'Data Export',
    description: 'Export your complete journey data to CSV format for backup',
  },
  {
    icon: 'FileText',
    title: 'Professional Reports',
    description: 'Generate detailed, shareable reports for therapists and counselors',
  },
  {
    icon: 'Calendar',
    title: 'Visual Calendar',
    description: 'Interactive calendar view of your entire progress timeline',
  },
  {
    icon: 'TrendingUp',
    title: 'Smart Predictions',
    description: 'AI-powered forecasting for upcoming milestones and achievements',
  },
  {
    icon: 'EyeOff',
    title: 'Ad-Free Journey',
    description: 'Completely distraction-free experience with all ads removed',
  },
];
