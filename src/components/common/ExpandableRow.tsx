import { useState, type ReactNode } from 'react';
import { View, Text, Pressable, LayoutAnimation } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ExpandableRowProps {
  title: string;
  /** Icon circle or similar, left of the title */
  leading?: ReactNode;
  /** Small text right of the title, e.g. "2 min" */
  meta?: string;
  defaultOpen?: boolean;
  /** First row in its card: no divider above */
  first?: boolean;
  children: ReactNode;
}

/** A row that opens to show its content; used for FAQ answers and guide sections */
export function ExpandableRow({ title, leading, meta, defaultOpen = false, first, children }: ExpandableRowProps) {
  const colors = useThemeColors();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(defaultOpen);

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!reducedMotion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  };

  return (
    <View className={first ? '' : 'border-t border-border'}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="flex-row items-center gap-3 px-4 py-3.5 min-h-[56px] active:bg-subtle"
      >
        {leading}
        <Text className="flex-1 text-base font-bold text-fg">{title}</Text>
        {meta ? <Text className="text-xs font-semibold text-muted">{meta}</Text> : null}
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <ChevronDown size={18} color={colors.faint} strokeWidth={2.5} />
        </View>
      </Pressable>
      {open && <View className="px-4 pb-4">{children}</View>}
    </View>
  );
}
