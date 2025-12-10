# RevenueCat Integration Guide

This document explains how RevenueCat has been integrated into the Seeding app for premium subscriptions.

## 📦 Installation

The following packages have been installed:

```bash
npm install react-native-purchases react-native-purchases-ui
```

## 🔧 Configuration

### API Key Setup

The RevenueCat configuration is located in `src/config/revenueCat.ts`:

```typescript
export const REVENUECAT_CONFIG = {
  apiKey: 'test_yvSsDIsRBrxnioHuMKnEWHFMIFr', // Test key for sandbox
};

export const ENTITLEMENT_ID = 'Seeding Pro';
export const OFFERING_ID = 'default';
```

**For production:**
1. Replace the test API key with your production keys
2. You can use environment variables:
   ```bash
   EXPO_PUBLIC_REVENUECAT_API_KEY=your_production_key
   ```

### RevenueCat Dashboard Setup

1. **Create Products** in RevenueCat dashboard:
   - Monthly subscription (ID: `monthly`)
   - Yearly subscription (ID: `yearly`)
   - Lifetime purchase (ID: `lifetime`)

2. **Create Entitlement**:
   - Entitlement ID: `Seeding Pro`
   - Attach all products to this entitlement

3. **Create Offering**:
   - Offering ID: `default`
   - Add all packages to this offering

4. **Configure Paywall** (optional):
   - Design your paywall UI in the RevenueCat dashboard
   - The app will automatically use this design

## 🏗️ Architecture

### File Structure

```
src/
├── config/
│   └── revenueCat.ts              # RevenueCat configuration
├── services/
│   └── revenueCatService.ts       # RevenueCat API wrapper
├── stores/
│   └── subscriptionStore.ts       # Zustand store for subscription state
├── hooks/
│   └── usePremium.ts              # Hook to check premium status
└── components/
    └── premium/
        ├── PaywallModal.tsx       # RevenueCat Paywall UI component
        ├── CustomerCenter.tsx     # RevenueCat Customer Center component
        └── PremiumGate.tsx        # Component to gate premium features
```

### Core Components

#### 1. RevenueCat Service (`src/services/revenueCatService.ts`)

Handles all RevenueCat SDK operations:
- `initialize()` - Initialize SDK
- `isPremium()` - Check premium status
- `getOfferings()` - Get available subscriptions
- `purchasePackage()` - Purchase a subscription
- `restorePurchases()` - Restore previous purchases
- `getSubscriptionInfo()` - Get current subscription details

#### 2. Subscription Store (`src/stores/subscriptionStore.ts`)

Zustand store managing subscription state:
- `isPremium` - Premium status
- `offerings` - Available subscription packages
- `customerInfo` - Customer information
- `initialize()` - Initialize RevenueCat
- `purchasePackage()` - Purchase subscription
- `restorePurchases()` - Restore purchases

#### 3. usePremium Hook (`src/hooks/usePremium.ts`)

Simple hook to check premium status:
```typescript
const { isPremium, isLoading } = usePremium();
```

## 🎨 UI Components

### Paywall Modal

Uses RevenueCat's pre-built Paywall UI component. Customize the design in the RevenueCat dashboard.

```typescript
import { PaywallModal } from '../src/components/premium/PaywallModal';

<PaywallModal
  visible={showPaywall}
  onClose={() => setShowPaywall(false)}
/>
```

### Customer Center

Self-service subscription management for premium users:

```typescript
import { CustomerCenter } from '../src/components/premium/CustomerCenter';

<CustomerCenter
  visible={showCustomerCenter}
  onClose={() => setShowCustomerCenter(false)}
/>
```

### Premium Gate

Component to gate features behind premium:

```typescript
import { PremiumGate } from '../src/components/premium/PremiumGate';

<PremiumGate featureName="Advanced Analytics">
  <AdvancedAnalyticsScreen />
</PremiumGate>
```

## 🚀 Usage Examples

### Check Premium Status

```typescript
import { usePremium } from '../src/hooks/usePremium';

function MyComponent() {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isPremium) {
    return <UpgradePrompt />;
  }

  return <PremiumFeature />;
}
```

### Show Paywall

```typescript
import { useState } from 'react';
import { PaywallModal } from '../src/components/premium/PaywallModal';

function MyComponent() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <Button onPress={() => setShowPaywall(true)}>
        Upgrade to Pro
      </Button>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </>
  );
}
```

### Gate Premium Features

```typescript
import { PremiumGate } from '../src/components/premium/PremiumGate';

function AnalyticsScreen() {
  return (
    <PremiumGate featureName="Advanced Analytics">
      <View>
        {/* Your premium feature here */}
        <AdvancedCharts />
        <DetailedReports />
      </View>
    </PremiumGate>
  );
}
```

## 🔄 Initialization

RevenueCat is automatically initialized when the app starts in `app/_layout.tsx`:

```typescript
const initializeSubscriptions = useSubscriptionStore((state) => state.initialize);

useEffect(() => {
  const initialize = async () => {
    await Promise.all([
      initializeDatabase(),
      initializeEncryptionKey(),
      initializeSubscriptions(), // RevenueCat initialized here
    ]);
  };

  initialize();
}, []);
```

## 📱 Settings Integration

The Settings screen (`app/(tabs)/settings.tsx`) includes:

**For Non-Premium Users:**
- "Upgrade to Pro" button to show paywall

**For Premium Users:**
- Premium status badge
- Subscription expiration/renewal date
- "Manage Subscription" button to open Customer Center

## 🧪 Testing

### Test Purchases

RevenueCat provides test products for development:
1. Use the test API key (already configured)
2. Enable sandbox mode in your device settings
3. Test purchases won't charge real money

### Subscription States to Test

1. **No subscription** - Test upgrade flow
2. **Active subscription** - Test premium features
3. **Expired subscription** - Test grace period
4. **Cancelled subscription** - Test restore purchases

## 🔐 Best Practices

1. **Always check premium status** before showing premium features
2. **Handle errors gracefully** - Network issues, cancelled purchases, etc.
3. **Provide restore purchases option** - For users who reinstall the app
4. **Use Customer Center** - Let users self-manage subscriptions
5. **Test thoroughly** - Test all subscription states and edge cases

## 📊 Product IDs

Configure these products in RevenueCat dashboard:

| Product ID | Type | Description |
|------------|------|-------------|
| `monthly` | Auto-renewable subscription | Monthly subscription |
| `yearly` | Auto-renewable subscription | Yearly subscription (best value) |
| `lifetime` | Non-consumable | One-time purchase for lifetime access |

## 🎯 Premium Features to Implement

Here are features you can gate behind premium:

1. **Advanced Analytics** - Detailed charts and insights
2. **Unlimited Tracking** - Remove any limits on tracking
3. **Custom Tags** - User-defined categories
4. **Data Export** - Export to CSV/PDF
5. **Cloud Backup** - Sync across devices
6. **Ad-Free** - Remove ads (if you add them to free tier)
7. **Priority Support** - Faster support response
8. **Early Access** - Beta features for premium users

## 🐛 Troubleshooting

### Issue: Paywall not showing
**Solution:** Check that offerings are configured in RevenueCat dashboard

### Issue: Purchase not completing
**Solution:** Ensure App Store Connect / Google Play Console is configured

### Issue: Premium status not updating
**Solution:** Call `refreshCustomerInfo()` after purchase

### Issue: Restore purchases not working
**Solution:** Ensure user is signed in to the same Apple ID / Google account

## 📚 Resources

- [RevenueCat Documentation](https://www.revenuecat.com/docs)
- [RevenueCat Dashboard](https://app.revenuecat.com/)
- [React Native Purchases SDK](https://www.revenuecat.com/docs/getting-started/installation/reactnative)
- [Paywall Configuration](https://www.revenuecat.com/docs/tools/paywalls)
- [Customer Center](https://www.revenuecat.com/docs/tools/customer-center)

## 🚀 Next Steps

1. **Configure products** in RevenueCat dashboard
2. **Design your paywall** in the RevenueCat dashboard
3. **Test the purchase flow** with sandbox accounts
4. **Implement premium features** using `<PremiumGate>` or `usePremium()`
5. **Submit for review** in App Store and Google Play

---

**Need Help?** Check the [RevenueCat documentation](https://www.revenuecat.com/docs) or [open an issue](https://github.com/anthropics/claude-code/issues).
