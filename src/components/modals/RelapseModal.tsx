import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { Leaf, CheckCircle, Plus, X } from 'lucide-react-native';
import { useRelapseStore } from '../../stores/relapseStore';
import { useAchievementStore } from '../../stores/achievementStore';
import { useToastStore } from '../../stores/toastStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useCustomTagsStore } from '../../stores/customTagsStore';
import { useJourneyStartLoader } from '../../hooks/useJourneyStartLoader';
import { getRandomTip, type EducationalTip } from '../../data/educationalContent';
import { RELAPSE_TAGS, formatRelapseTag } from '../../constants/tags';
import { getGrowthStage } from '../../utils/growthStages';
import { computeStreaks, countDaysKept, longestStreakMs, toWholeDays } from '../../utils/streaks';
import { formatStreakAdjective, formatStreakLength } from '../../utils/formatDuration';
import ConfirmationDialog from '../common/ConfirmationDialog';
import type { Relapse } from '../../db/schema';

interface RelapseModalProps {
  onClose: () => void;
  /** "Not yet" on the check-in step: close this screen and open the urge help screen */
  onNeedUrgeHelp?: () => void;
  /** Opens straight into the details step, with Save and Delete */
  existingRelapse?: Relapse;
}

type Step = 'check' | 'details' | 'plant';
type WhenMode = 'now' | 'earlier' | 'pick';

// Maximum number of tags that can be selected per relapse
const MAX_TAGS = 5;
// The tag counter only appears once it's useful
const SHOW_COUNTER_FROM = 3;
const UNDO_WINDOW_MS = 10000;
// How many past plants fit in the step-3 garden row
const GARDEN_ROW_SIZE = 7;

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function formatWhen(date: Date): string {
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, today)) return `Today, ${time}`;
  if (isSameDay(date, yesterday)) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}, ${time}`;
}

function withDate(base: Date, picked: Date): Date {
  const next = new Date(base);
  next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  return next;
}

function withTime(base: Date, picked: Date): Date {
  const next = new Date(base);
  next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return next;
}

function formatDays(ms: number): string {
  const days = toWholeDays(ms);
  if (days < 1) return formatStreakLength(ms);
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}

/**
 * Removing or moving the latest relapse changes when the current streak started.
 * Point the achievement check at the new start first, so old milestones aren't celebrated again.
 */
function primeAchievementCheck(relapsesAfter: { timestamp: string }[], journeyStart: string | null) {
  const latest = relapsesAfter.reduce<number | null>((max, r) => {
    const t = new Date(r.timestamp).getTime();
    return max === null || t > max ? t : max;
  }, null);
  const start = latest ?? (journeyStart ? new Date(journeyStart).getTime() : null);
  if (start !== null) {
    useAchievementStore.getState().setLastCheckedElapsedTime(Math.max(0, Date.now() - start));
  }
}

async function undoRelapse(id: string, journeyStart: string | null) {
  const { relapses, deleteRelapse } = useRelapseStore.getState();
  const { showToast } = useToastStore.getState();
  primeAchievementCheck(relapses.filter((r) => r.id !== id), journeyStart);
  try {
    await deleteRelapse(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast('Relapse removed. Your streak is back.');
  } catch {
    showToast("Couldn't undo. You can delete it from History.");
  }
}

function Chip({
  label,
  selected,
  tone = 'default',
  disabled,
  onPress,
  trailing,
}: {
  label: string;
  selected?: boolean;
  tone?: 'default' | 'custom';
  disabled?: boolean;
  onPress: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      className={`px-4 py-2.5 rounded-full flex-row items-center gap-2 border ${
        selected
          ? 'bg-relapse-soft border-relapse/50'
          : tone === 'custom'
            ? 'bg-plum-soft border-transparent'
            : 'bg-subtle border-transparent'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <Text
        className={`text-sm font-semibold ${
          selected
            ? 'text-relapse-ink'
            : tone === 'custom'
              ? 'text-plum'
              : 'text-body'
        }`}
      >
        {label}
      </Text>
      {trailing}
    </Pressable>
  );
}

export default function RelapseModal({ onClose, onNeedUrgeHelp, existingRelapse }: RelapseModalProps) {
  const isEdit = !!existingRelapse;
  const relapses = useRelapseStore((state) => state.relapses);
  const addRelapse = useRelapseStore((state) => state.addRelapse);
  const updateRelapse = useRelapseStore((state) => state.updateRelapse);
  const deleteRelapse = useRelapseStore((state) => state.deleteRelapse);
  const showToast = useToastStore((state) => state.showToast);
  const { journeyStart } = useJourneyStartLoader();
  const colors = useThemeColors();
  const { customTags, loadCustomTags, addCustomTag, removeCustomTag } = useCustomTagsStore();

  const [step, setStep] = useState<Step>(isEdit ? 'details' : 'check');
  const [tip] = useState<EducationalTip>(() => getRandomTip('relapse'));

  // Details
  const [note, setNote] = useState(existingRelapse?.note ?? '');
  const [showNote, setShowNote] = useState(!!existingRelapse?.note);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingRelapse?.tags ?? []);
  const [whenMode, setWhenMode] = useState<WhenMode>(isEdit ? 'pick' : 'now');
  const [customTime, setCustomTime] = useState<Date>(() =>
    existingRelapse ? new Date(existingRelapse.timestamp) : new Date()
  );
  const [androidPicker, setAndroidPicker] = useState<'date' | 'time' | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  // Saving
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Fixed on reaching step 3 so the summary doesn't shift while it's being read
  const [loggedAt, setLoggedAt] = useState<number | null>(null);

  useEffect(() => {
    loadCustomTags();
  }, []);

  const allTags = [...RELAPSE_TAGS, ...customTags];
  const isAtLimit = selectedTags.length >= MAX_TAGS;
  const placeholderColor = colors.muted;

  // ---------------------------------------------------------------------------
  // When
  // ---------------------------------------------------------------------------

  const resolveTimestamp = () => (whenMode === 'now' ? Date.now() : customTime.getTime());

  const validateTime = (ms: number): string | null => {
    if (ms > Date.now() + 60000) return "That time hasn't happened yet. Pick an earlier time.";
    if (journeyStart && ms < new Date(journeyStart).getTime()) {
      const started = new Date(journeyStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `Your journey started on ${started}. Pick a time after that.`;
    }
    return null;
  };

  const chooseWhen = (mode: WhenMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeError(null);
    setWhenMode(mode);
    if (mode === 'now') return;
    if (mode === 'earlier') setCustomTime((t) => withDate(t, new Date()));
    if (Platform.OS === 'android') setAndroidPicker(mode === 'earlier' ? 'time' : 'date');
  };

  const handleAndroidPick = (event: DateTimePickerEvent, picked?: Date) => {
    const current = androidPicker;
    setAndroidPicker(null);
    if (event.type !== 'set' || !picked) return;
    if (current === 'date') {
      setCustomTime((t) => withDate(t, picked));
      setAndroidPicker('time'); // then ask for the time
    } else {
      const next = withTime(customTime, picked);
      setCustomTime(next);
      setTimeError(validateTime(next.getTime()));
    }
  };

  const handleIosPick = (_event: DateTimePickerEvent, picked?: Date) => {
    if (!picked) return;
    setCustomTime(picked);
    setTimeError(validateTime(picked.getTime()));
  };

  // ---------------------------------------------------------------------------
  // Tags
  // ---------------------------------------------------------------------------

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (isAtLimit) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setSelectedTags((prev) => [...prev, tag]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleAddCustomTag = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    const success = await addCustomTag(trimmed);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewTagName('');
      setShowAddTag(false);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleRemoveCustomTag = async (tag: string) => {
    await removeCustomTag(tag);
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ---------------------------------------------------------------------------
  // Step 3 summary
  // ---------------------------------------------------------------------------

  const plant = useMemo(() => {
    if (loggedAt === null || !journeyStart) return null;
    const latestMs = relapses.length > 0 ? new Date(relapses[0].timestamp).getTime() : null;
    // Logged before the latest relapse: it splits an older streak and the current one keeps going
    const isEarlierThanLatest = latestMs !== null && loggedAt < latestMs;

    const before = relapses.filter((r) => new Date(r.timestamp).getTime() <= loggedAt);
    const streaksUpToNow = computeStreaks(before, journeyStart, loggedAt);
    const planted = streaksUpToNow[streaksUpToNow.length - 1];
    const gardenRow = streaksUpToNow
      .slice(-GARDEN_ROW_SIZE - 1, -1)
      .map((s) => getGrowthStage(s.durationMs).emoji);

    const withNew = [...relapses, { timestamp: new Date(loggedAt).toISOString() }];
    const keptBefore = countDaysKept(relapses, journeyStart);
    const keptAfter = countDaysKept(withNew, journeyStart);
    const bestAfterMs = longestStreakMs(computeStreaks(withNew, journeyStart));

    return {
      isEarlierThanLatest,
      plantedMs: planted.durationMs,
      plantedStage: getGrowthStage(planted.durationMs),
      gardenRow,
      keptAfter,
      keptUnchanged: keptAfter === keptBefore,
      bestAfterMs,
      bestStage: getGrowthStage(bestAfterMs),
    };
  }, [loggedAt, relapses, journeyStart]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const goToPlant = () => {
    const ms = resolveTimestamp();
    const error = validateTime(ms);
    if (error) {
      setTimeError(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoggedAt(ms);
    setStep('plant');
  };

  const handlePlant = async () => {
    if (loggedAt === null) return;
    try {
      setIsSubmitting(true);
      const saved = await addRelapse({
        timestamp: new Date(loggedAt).toISOString(),
        note: note.trim() || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
      showToast(plant?.isEarlierThanLatest ? '📍 Relapse saved' : '🫘 New seed planted', {
        durationMs: UNDO_WINDOW_MS,
        action: { label: 'Undo', onPress: () => undoRelapse(saved.id, journeyStart) },
      });
    } catch (error) {
      if (__DEV__) console.error('Failed to save relapse:', error);
      setIsSubmitting(false);
      Alert.alert('Failed to Save', 'Could not save your entry. Please try again.', [{ text: 'OK', style: 'default' }]);
    }
  };

  const handleSaveEdit = async () => {
    if (!existingRelapse) return;
    const ms = resolveTimestamp();
    const error = validateTime(ms);
    if (error) {
      setTimeError(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    const timestamp = new Date(ms).toISOString();
    try {
      setIsSubmitting(true);
      primeAchievementCheck(
        relapses.map((r) => (r.id === existingRelapse.id ? { timestamp } : r)),
        journeyStart
      );
      await updateRelapse(existingRelapse.id, { timestamp, note: note.trim(), tags: selectedTags });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
      showToast('Changes saved');
    } catch (error) {
      if (__DEV__) console.error('Failed to update relapse:', error);
      setIsSubmitting(false);
      Alert.alert('Failed to Save', 'Could not save your changes. Please try again.', [{ text: 'OK', style: 'default' }]);
    }
  };

  const handleDelete = async () => {
    if (!existingRelapse) return;
    primeAchievementCheck(relapses.filter((r) => r.id !== existingRelapse.id), journeyStart);
    await deleteRelapse(existingRelapse.id);
    setConfirmDelete(false);
    onClose();
    showToast('Relapse deleted');
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const renderHeader = (title: string, subtitle?: string) => (
    <View className="px-6 pt-16 pb-0">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1 pr-4">
          <Text className="mb-1 text-3xl font-semibold tracking-wide text-fg">{title}</Text>
          {subtitle && <Text className="text-sm font-regular text-muted">{subtitle}</Text>}
        </View>
        <View className="items-center justify-center w-16 h-16 bg-surface rounded-2xl">
          <Leaf size={34} color={colors.relapse} strokeWidth={2.5} />
        </View>
      </View>
    </View>
  );

  const renderCheckStep = () => (
    <>
      {renderHeader('Log a relapse')}

      {/* The warning lives here, before the person says it already happened */}
      <View className="px-5 mt-3">
        <View className="p-4 border bg-relapse-soft rounded-xl border-relapse/30">
          <Text className="mb-1 text-xs font-bold tracking-wide uppercase text-relapse-ink">
            Think before you log
          </Text>
          <Text className="mb-2 text-lg font-bold text-relapse-ink">
            {tip.emoji} {tip.title}
          </Text>
          <Text className="text-sm leading-6 font-regular text-relapse-ink">{tip.content}</Text>
        </View>
      </View>

      <View className="gap-3 px-5 mt-6 mb-8">
        <Text className="mb-1 text-lg font-semibold text-fg">Has it already happened?</Text>

        <Pressable
          onPress={() => (onNeedUrgeHelp ? onNeedUrgeHelp() : onClose())}
          accessibilityRole="button"
          className="items-center px-4 py-4 rounded-2xl bg-primary active:bg-primary-ink"
        >
          <Text className="text-base font-bold text-primary-on">Not yet, help me ride it out</Text>
          <Text className="mt-0.5 text-xs font-medium text-primary-on/85">Opens the urge screen</Text>
        </Pressable>

        <Pressable
          onPress={() => setStep('details')}
          accessibilityRole="button"
          className="items-center py-4 bg-surface border border-border rounded-2xl active:bg-bg"
        >
          <Text className="text-base font-bold text-body">Yes, it happened</Text>
        </Pressable>

        <Pressable onPress={onClose} accessibilityRole="button" className="items-center py-3">
          <Text className="text-sm font-semibold text-muted">Cancel</Text>
        </Pressable>
      </View>
    </>
  );

  const renderWhen = () => (
    <View className="mb-6">
      <Text className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">When</Text>
      <View className="flex-row flex-wrap gap-2">
        <Chip label="Just now" selected={whenMode === 'now'} onPress={() => chooseWhen('now')} />
        <Chip label="Earlier today" selected={whenMode === 'earlier'} onPress={() => chooseWhen('earlier')} />
        <Chip label="Pick date" selected={whenMode === 'pick'} onPress={() => chooseWhen('pick')} />
      </View>

      {whenMode !== 'now' && (
        <View className="flex-row items-center justify-between p-3 mt-3 border border-border bg-bg rounded-xl">
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={customTime}
              mode={whenMode === 'earlier' ? 'time' : 'datetime'}
              display="compact"
              maximumDate={new Date()}
              minimumDate={journeyStart ? new Date(journeyStart) : undefined}
              onChange={handleIosPick}
            />
          ) : (
            <>
              <Text className="text-sm font-semibold text-fg">{formatWhen(customTime)}</Text>
              <Pressable
                onPress={() => setAndroidPicker(whenMode === 'earlier' ? 'time' : 'date')}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text className="text-sm font-semibold text-relapse-ink">Change</Text>
              </Pressable>
            </>
          )}
        </View>
      )}

      {timeError && (
        <Text className="mt-2 text-sm font-medium text-urge">{timeError}</Text>
      )}
    </View>
  );

  const renderTriggers = () => (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs font-semibold tracking-wide text-muted uppercase">Triggers</Text>
        <View className="flex-row items-center gap-3">
          {selectedTags.length >= SHOW_COUNTER_FROM && (
            <Text className={`text-xs font-semibold ${isAtLimit ? 'text-relapse-ink' : 'text-muted'}`}>
              {selectedTags.length}/{MAX_TAGS}
            </Text>
          )}
          {customTags.length > 0 && (
            <Pressable onPress={() => setEditingTags((v) => !v)} accessibilityRole="button" hitSlop={8}>
              <Text className="text-xs font-semibold text-muted">{editingTags ? 'Done' : 'Edit'}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {allTags.map((tag) => {
          const isCustom = customTags.includes(tag);
          const isSelected = selectedTags.includes(tag);
          if (editingTags && isCustom) {
            return (
              <Chip
                key={tag}
                label={tag}
                tone="custom"
                onPress={() => handleRemoveCustomTag(tag)}
                trailing={<X size={14} color={colors.plum} strokeWidth={2.5} />}
              />
            );
          }
          return (
            <Chip
              key={tag}
              label={formatRelapseTag(tag)}
              selected={isSelected}
              tone={isCustom ? 'custom' : 'default'}
              disabled={isAtLimit && !isSelected}
              onPress={() => toggleTag(tag)}
            />
          );
        })}

        {!showAddTag && !editingTags && (
          <Pressable
            onPress={() => setShowAddTag(true)}
            accessibilityRole="button"
            className="px-4 py-2.5 rounded-full flex-row items-center gap-2 border-2 border-dashed border-border-strong"
          >
            <Plus size={16} color={placeholderColor} strokeWidth={2.5} />
            <Text className="text-sm font-semibold text-muted">Add</Text>
          </Pressable>
        )}
      </View>

      {showAddTag && (
        <View className="flex-row items-center w-full gap-2 mt-3">
          <TextInput
            value={newTagName}
            onChangeText={setNewTagName}
            placeholder="New trigger..."
            placeholderTextColor={placeholderColor}
            className="flex-1 px-4 py-3 text-sm font-medium text-fg bg-subtle rounded-xl"
            autoFocus
            maxLength={20}
            onSubmitEditing={handleAddCustomTag}
          />
          <Pressable onPress={handleAddCustomTag} accessibilityLabel="Add trigger" className="items-center justify-center w-10 h-10 bg-primary rounded-xl">
            <CheckCircle size={20} color={colors.onPrimary} strokeWidth={2.5} />
          </Pressable>
          <Pressable
            onPress={() => {
              setShowAddTag(false);
              setNewTagName('');
            }}
            accessibilityLabel="Cancel"
            className="items-center justify-center w-10 h-10 bg-border rounded-xl"
          >
            <X size={20} color={placeholderColor} strokeWidth={2.5} />
          </Pressable>
        </View>
      )}

      {editingTags && (
        <Text className="mt-3 text-xs font-regular text-faint">Tap a custom trigger to remove it.</Text>
      )}
    </View>
  );

  const renderNote = () =>
    showNote ? (
      <View>
        <Text className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Note</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Where were you, what time was it, how were you feeling?"
          placeholderTextColor={placeholderColor}
          multiline
          numberOfLines={4}
          autoFocus={!isEdit}
          className="bg-bg rounded-xl p-4 text-base font-regular text-fg min-h-[100px] border border-border"
          textAlignVertical="top"
        />
      </View>
    ) : (
      <Pressable onPress={() => setShowNote(true)} accessibilityRole="button" className="flex-row items-center gap-2 py-1">
        <Plus size={16} color={placeholderColor} strokeWidth={2.5} />
        <Text className="text-sm font-semibold text-muted">Add a note</Text>
      </Pressable>
    );

  const renderDetailsStep = () => {
    const hasDetails = selectedTags.length > 0 || note.trim().length > 0 || whenMode !== 'now';
    return (
      <>
        {isEdit
          ? renderHeader('Edit relapse', formatWhen(new Date(existingRelapse!.timestamp)))
          : renderHeader('What happened?', 'Helps you spot patterns later. Skip anything.')}

        <View className="px-4 mt-4">
          <View className="p-6 bg-surface border border-border rounded-[20px]">
            {renderWhen()}
            {renderTriggers()}
            {renderNote()}
          </View>
        </View>

        <View className="gap-3 px-4 mt-4 mb-8">
          <Pressable
            onPress={isEdit ? handleSaveEdit : goToPlant}
            disabled={isSubmitting}
            accessibilityRole="button"
            className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-relapse/25 active:bg-relapse/40"
          >
            {isSubmitting && <ActivityIndicator size="small" color={colors.relapseInk} />}
            <Text className="text-lg font-bold text-center text-relapse-ink">
              {isEdit ? 'Save changes' : hasDetails ? 'Continue' : 'Continue without details'}
            </Text>
          </Pressable>

          {isEdit ? (
            <>
              <Pressable
                onPress={onClose}
                disabled={isSubmitting}
                accessibilityRole="button"
                className="py-4 bg-surface border border-border rounded-2xl"
              >
                <Text className="text-lg font-bold text-center text-body">Cancel</Text>
              </Pressable>
              <Pressable onPress={() => setConfirmDelete(true)} accessibilityRole="button" className="items-center py-3">
                <Text className="text-sm font-semibold text-urge">Delete this relapse</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => setStep('check')} accessibilityRole="button" className="items-center py-3">
              <Text className="text-sm font-semibold text-muted">Back</Text>
            </Pressable>
          )}
        </View>
      </>
    );
  };

  const renderPlantStep = () => {
    if (!plant) {
      // Journey start is still loading
      return (
        <View className="items-center pt-32">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    const when = loggedAt !== null ? formatWhen(new Date(loggedAt)) : '';

    return (
      <View className="px-5 pt-20 pb-8">
        {plant.isEarlierThanLatest ? (
          <View className="items-center">
            <Text style={{ fontSize: 56 }}>📍</Text>
            <Text className="mt-4 text-2xl font-semibold text-center text-fg">Logged for {when}</Text>
            <Text className="mt-2 text-base text-center font-regular text-muted">
              Your current streak keeps going. This splits an earlier streak in your garden.
            </Text>
          </View>
        ) : (
          <View className="items-center">
            <Text style={{ fontSize: 64 }}>{plant.plantedStage.emoji}</Text>
            <Text className="mt-4 text-2xl font-semibold text-center text-fg">
              Your {formatStreakAdjective(plant.plantedMs)} streak goes into your garden
            </Text>

            {/* Garden row: recent plants, then the one being planted */}
            <View className="flex-row items-end justify-center w-full gap-1 pt-4 pb-2 mt-4 border-b-2 border-border">
              {plant.gardenRow.map((emoji, i) => (
                <Text key={`g-${i}`} style={{ fontSize: 22 }}>{emoji}</Text>
              ))}
              <View className="px-1 border-2 rounded-lg border-primary">
                <Text style={{ fontSize: 22 }}>{plant.plantedStage.emoji}</Text>
              </View>
            </View>
          </View>
        )}

        <View className="flex-row gap-3 mt-6">
          <View className="flex-1 p-3 rounded-xl bg-primary-soft">
            <Text className="text-xs font-semibold text-primary-ink">Days kept</Text>
            <Text className="text-lg font-bold text-primary-ink">
              {plant.keptUnchanged ? 'still ' : ''}{plant.keptAfter}
            </Text>
          </View>
          <View className="flex-1 p-3 rounded-xl bg-relapse-soft">
            <Text className="text-xs font-semibold text-relapse-ink">Best streak</Text>
            <Text className="text-lg font-bold text-relapse-ink">
              {formatDays(plant.bestAfterMs)} {plant.bestStage.emoji}
            </Text>
          </View>
        </View>

        <View className="gap-3 mt-8">
          <Pressable
            onPress={handlePlant}
            disabled={isSubmitting}
            accessibilityRole="button"
            className="flex-row items-center justify-center gap-2 py-4 rounded-2xl bg-primary active:bg-primary-ink"
          >
            {isSubmitting && <ActivityIndicator size="small" color={colors.onPrimary} />}
            <Text className="text-lg font-bold text-primary-on">
              {isSubmitting ? 'Planting…' : plant.isEarlierThanLatest ? 'Save it' : 'Plant it and start a new seed 🫘'}
            </Text>
          </Pressable>
          <Pressable onPress={() => setStep('details')} disabled={isSubmitting} accessibilityRole="button" className="items-center py-3">
            <Text className="text-sm font-semibold text-muted">Back</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg"
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {step === 'check' && renderCheckStep()}
        {step === 'details' && renderDetailsStep()}
        {step === 'plant' && renderPlantStep()}
      </ScrollView>

      {/* Android shows date and time as separate dialogs */}
      {Platform.OS === 'android' && androidPicker && (
        <DateTimePicker
          key={androidPicker}
          value={customTime}
          mode={androidPicker}
          maximumDate={androidPicker === 'date' ? new Date() : undefined}
          minimumDate={androidPicker === 'date' && journeyStart ? new Date(journeyStart) : undefined}
          onChange={handleAndroidPick}
        />
      )}

      <ConfirmationDialog
        visible={confirmDelete}
        title="Delete this relapse?"
        message="It will be removed from your history and your streaks will be recalculated."
        confirmText="Delete"
        cancelText="Keep it"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </KeyboardAvoidingView>
  );
}
