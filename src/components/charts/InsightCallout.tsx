import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { TokenName } from '../../constants/palette';

interface InsightCalloutProps {
  icon: LucideIcon;
  /** Bold first line. With a title the icon sits in a soft circle. */
  title?: string;
  children: ReactNode;
  /** 'neutral' for explanations and praise, 'warning' (amber) only for relapse-risk alerts */
  variant?: 'neutral' | 'warning';
  /** Icon color for titled callouts, e.g. 'primary' for praise */
  accent?: Extract<TokenName, 'primary' | 'info' | 'gold' | 'plum'>;
  className?: string;
}

const ACCENT_BG = {
  primary: 'bg-primary-soft',
  info: 'bg-info-soft',
  gold: 'bg-gold-soft',
  plum: 'bg-plum-soft',
} as const;

/**
 * Explanation, praise or warning box inside a chart card.
 * Neutral boxes stay grey with a small colored icon; only relapse warnings keep a tint.
 */
export function InsightCallout({
  icon: Icon,
  title,
  children,
  variant = 'neutral',
  accent = 'primary',
  className = '',
}: InsightCalloutProps) {
  const colors = useThemeColors();
  const isWarning = variant === 'warning';
  const bodyColor = isWarning ? 'text-relapse-ink' : 'text-body';

  return (
    <View
      className={`flex-row items-start gap-3 px-3.5 py-3 rounded-2xl ${isWarning ? 'bg-relapse-soft' : 'bg-subtle'} ${className}`}
    >
      {title ? (
        <View className={`items-center justify-center w-8 h-8 rounded-full ${ACCENT_BG[accent]}`}>
          <Icon size={16} color={colors[accent]} strokeWidth={2.75} />
        </View>
      ) : (
        <View className="mt-0.5">
          <Icon size={17} color={isWarning ? colors.relapseInk : colors.muted} strokeWidth={2.5} />
        </View>
      )}
      <View className="flex-1">
        {title && <Text className="mb-0.5 text-base font-bold text-fg">{title}</Text>}
        {typeof children === 'string' ? (
          <Text className={`font-regular text-sm ${bodyColor}`}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}
