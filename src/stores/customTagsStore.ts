import { create } from 'zustand';
import { getAppSetting, setAppSetting } from '../db/helpers';

const CUSTOM_TAGS_KEY = 'custom_relapse_tags';

interface CustomTagsState {
  customTags: string[];
  isLoading: boolean;

  // Actions
  loadCustomTags: () => Promise<void>;
  addCustomTag: (tag: string) => Promise<boolean>;
  removeCustomTag: (tag: string) => Promise<void>;
}

export const useCustomTagsStore = create<CustomTagsState>((set, get) => ({
  customTags: [],
  isLoading: false,

  loadCustomTags: async () => {
    set({ isLoading: true });
    try {
      const stored = await getAppSetting(CUSTOM_TAGS_KEY);
      if (stored) {
        const tags = JSON.parse(stored);
        set({ customTags: tags });
      }
    } catch (error) {
      console.error('[CustomTagsStore] Failed to load custom tags:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addCustomTag: async (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return false;

    const { customTags } = get();

    // Check if tag already exists (case-insensitive)
    if (customTags.some(t => t.toLowerCase() === trimmedTag.toLowerCase())) {
      return false;
    }

    const updatedTags = [...customTags, trimmedTag];

    try {
      await setAppSetting(CUSTOM_TAGS_KEY, JSON.stringify(updatedTags));
      set({ customTags: updatedTags });
      return true;
    } catch (error) {
      console.error('[CustomTagsStore] Failed to add custom tag:', error);
      return false;
    }
  },

  removeCustomTag: async (tag: string) => {
    const { customTags } = get();
    const updatedTags = customTags.filter(t => t !== tag);

    try {
      await setAppSetting(CUSTOM_TAGS_KEY, JSON.stringify(updatedTags));
      set({ customTags: updatedTags });
    } catch (error) {
      console.error('[CustomTagsStore] Failed to remove custom tag:', error);
    }
  },
}));
