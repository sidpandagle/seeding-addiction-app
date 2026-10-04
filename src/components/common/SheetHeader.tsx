import { View, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface SheetHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

/** Title, subtitle and close button at the top of a full-screen info sheet */
export function SheetHeader({ title, subtitle, onClose }: SheetHeaderProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center justify-between gap-4 px-6 pt-16 pb-4">
      <View className="flex-1">
        <Text className="text-3xl font-semibold tracking-wide text-fg">{title}</Text>
        {subtitle ? <Text className="mt-1 text-sm font-medium text-muted">{subtitle}</Text> : null}
      </View>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={8}
        className="items-center justify-center rounded-full w-11 h-11 bg-subtle active:bg-border"
      >
        <X size={22} color={colors.fg} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
