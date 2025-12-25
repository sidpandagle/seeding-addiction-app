import { View, Text, Modal, Pressable, FlatList } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { BadgeCategory } from '../../db/schema';
import { useColorScheme } from '../../stores/themeStore';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface CategoryFilterModalProps {
  visible: boolean;
  selectedCategory: BadgeCategory | 'all';
  onSelectCategory: (category: BadgeCategory | 'all') => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<BadgeCategory | 'all', string> = {
  all: 'All Badges',
  frequency: 'Frequency',
  streak: 'Streaks',
  diversity: 'Diversity',
  milestone: 'Milestones',
  recovery: 'Recovery',
  special: 'Special',
};

const CATEGORY_DESCRIPTIONS: Record<BadgeCategory | 'all', string> = {
  all: 'Show all available badges',
  frequency: 'Earned by logging activities regularly',
  streak: 'Earned by maintaining consecutive days',
  diversity: 'Earned by trying different activities',
  milestone: 'Earned at major journey milestones',
  recovery: 'Earned for resilience after challenges',
  special: 'Rare achievements and special occasions',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CategoryFilterModal({
  visible,
  selectedCategory,
  onSelectCategory,
  onClose,
}: CategoryFilterModalProps) {
  const colorScheme = useColorScheme();

  const categories: (BadgeCategory | 'all')[] = [
    'all',
    'frequency',
    'streak',
    'diversity',
    'milestone',
    'recovery',
    'special',
  ];

  const handleSelectCategory = (category: BadgeCategory | 'all') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectCategory(category);
    // Close modal after short delay to show selection
    setTimeout(onClose, 150);
  };

  const renderCategory = ({ item }: { item: BadgeCategory | 'all' }) => {
    const isSelected = item === selectedCategory;

    return (
      <Pressable
        onPress={() => handleSelectCategory(item)}
        className={`flex-row items-center p-4 mb-2 border rounded-2xl ${
          isSelected
            ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 dark:border-amber-600'
            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
        }`}
      >
        <View className="flex-1 mr-3">
          <Text
            className={`text-base font-bold mb-1 ${
              isSelected
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {CATEGORY_LABELS[item]}
          </Text>
          <Text className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {CATEGORY_DESCRIPTIONS[item]}
          </Text>
        </View>

        {isSelected && (
          <View className="p-2 bg-amber-500 rounded-full">
            <Check size={16} color="#fff" strokeWidth={3} />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 bg-black/50"
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View
        entering={SlideInDown.springify()}
        exiting={SlideOutDown.springify()}
        className="absolute bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-950 rounded-t-3xl"
        style={{ maxHeight: '75%' }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Filter Badges
          </Text>
          <Pressable
            onPress={onClose}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800"
          >
            <X size={20} color={colorScheme === 'dark' ? '#fff' : '#000'} strokeWidth={2.5} />
          </Pressable>
        </View>

        {/* Category List */}
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </Modal>
  );
}
