import { create } from 'zustand';
import { getAppSetting, setAppSetting } from '../db/helpers';

const CUSTOM_ACTIVITY_TAGS_KEY = 'custom_activity_tags';

export interface CustomActivityTag {
  id: string;
  emoji: string;
  label: string;
}

interface CustomActivityTagsState {
  customTags: CustomActivityTag[];
  isLoading: boolean;

  // Actions
  loadCustomTags: () => Promise<void>;
  addCustomTag: (emoji: string, label: string) => Promise<boolean>;
  removeCustomTag: (id: string) => Promise<void>;
  updateCustomTag: (id: string, emoji: string, label: string) => Promise<boolean>;
}

// Generate a unique ID
const generateId = () => `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Format tag for display (emoji + label)
export const formatActivityTag = (tag: CustomActivityTag): string => {
  return `${tag.emoji} ${tag.label}`;
};

export const useCustomActivityTagsStore = create<CustomActivityTagsState>((set, get) => ({
  customTags: [],
  isLoading: false,

  loadCustomTags: async () => {
    set({ isLoading: true });
    try {
      const stored = await getAppSetting(CUSTOM_ACTIVITY_TAGS_KEY);
      if (stored) {
        const tags = JSON.parse(stored);
        set({ customTags: tags });
      }
    } catch (error) {
      console.error('[CustomActivityTagsStore] Failed to load custom tags:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addCustomTag: async (emoji: string, label: string) => {
    const trimmedLabel = label.trim();
    const trimmedEmoji = emoji.trim();

    if (!trimmedLabel || !trimmedEmoji) return false;

    const { customTags } = get();

    // Check if tag with same label already exists (case-insensitive)
    if (customTags.some(t => t.label.toLowerCase() === trimmedLabel.toLowerCase())) {
      return false;
    }

    // Limit to 10 custom tags
    if (customTags.length >= 10) {
      return false;
    }

    const newTag: CustomActivityTag = {
      id: generateId(),
      emoji: trimmedEmoji,
      label: trimmedLabel,
    };

    const updatedTags = [...customTags, newTag];

    try {
      await setAppSetting(CUSTOM_ACTIVITY_TAGS_KEY, JSON.stringify(updatedTags));
      set({ customTags: updatedTags });
      return true;
    } catch (error) {
      console.error('[CustomActivityTagsStore] Failed to add custom tag:', error);
      return false;
    }
  },

  removeCustomTag: async (id: string) => {
    const { customTags } = get();
    const updatedTags = customTags.filter(t => t.id !== id);

    try {
      await setAppSetting(CUSTOM_ACTIVITY_TAGS_KEY, JSON.stringify(updatedTags));
      set({ customTags: updatedTags });
    } catch (error) {
      console.error('[CustomActivityTagsStore] Failed to remove custom tag:', error);
    }
  },

  updateCustomTag: async (id: string, emoji: string, label: string) => {
    const trimmedLabel = label.trim();
    const trimmedEmoji = emoji.trim();

    if (!trimmedLabel || !trimmedEmoji) return false;

    const { customTags } = get();

    // Check if another tag with same label exists
    if (customTags.some(t => t.id !== id && t.label.toLowerCase() === trimmedLabel.toLowerCase())) {
      return false;
    }

    const updatedTags = customTags.map(t =>
      t.id === id ? { ...t, emoji: trimmedEmoji, label: trimmedLabel } : t
    );

    try {
      await setAppSetting(CUSTOM_ACTIVITY_TAGS_KEY, JSON.stringify(updatedTags));
      set({ customTags: updatedTags });
      return true;
    } catch (error) {
      console.error('[CustomActivityTagsStore] Failed to update custom tag:', error);
      return false;
    }
  },
}));

// Popular emoji suggestions for activities
export const SUGGESTED_EMOJIS = [
  '🎯', '💪', '🧠', '❤️', '🌟', '🔥', '✨', '🎮',
  '🎨', '📱', '💻', '🎵', '📚', '🏋️', '🚶', '🧘',
  '🍳', '🛠️', '🎸', '🎤', '🎬', '📷', '🌿', '🐕',
  '🚗', '✈️', '🏠', '👨‍👩‍👧', '🤝', '💼', '📝', '🧹',
];
