import { useSubscriptionStore } from '../stores/subscriptionStore';

/**
 * Hook to check if user has premium access
 * Use this to conditionally render premium features
 *
 * @example
 * ```tsx
 * const { isPremium, isLoading } = usePremium();
 *
 * if (!isPremium) {
 *   return <PremiumUpsell />;
 * }
 *
 * return <PremiumFeature />;
 * ```
 */
export const usePremium = () => {
  const isPremium = useSubscriptionStore((state) => state.isPremium);
  const isLoading = useSubscriptionStore((state) => state.isLoading);
  const expirationDate = useSubscriptionStore((state) => state.expirationDate);
  const willRenew = useSubscriptionStore((state) => state.willRenew);

  return {
    isPremium,
    isLoading,
    expirationDate,
    willRenew,
  };
};
