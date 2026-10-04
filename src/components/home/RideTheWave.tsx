import { useEffect, useRef, useState, type ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Waves, Volume2, VolumeX } from 'lucide-react-native';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useThemeColors, useCardShadow } from '../../hooks/useThemeColors';
import { getAppSetting, setAppSetting } from '../../db/helpers';
import { notificationService } from '../../services/notificationService';

interface RideTheWaveProps {
  /** Called when the person chooses to save a finished timer as a win */
  onLogWin: (minutes: number) => Promise<void>;
}

type Phase = 'idle' | 'running' | 'done' | 'logged';

const DURATION_OPTIONS = [5, 10, 15, 20, 30] as const;
const DEFAULT_MINUTES = 10;

const TONES = {
  chime: { label: 'Chime', source: require('../../../assets/sounds/chime.wav') },
  bell: { label: 'Bell', source: require('../../../assets/sounds/bell.wav') },
  soft: { label: 'Soft', source: require('../../../assets/sounds/soft.wav') },
  off: { label: 'Off', source: null },
} as const;
type ToneId = keyof typeof TONES;
const TONE_IDS = Object.keys(TONES) as ToneId[];

const MINUTES_KEY = 'urge_timer_minutes';
const TONE_KEY = 'urge_timer_tone';

// Only ring if the end was just now; coming back from the background much later stays quiet
// (the notification already went off then)
const RING_WINDOW_MS = 3000;

// One breath: 4 s in, 6 s out
const BREATHE_IN_S = 4;
const BREATH_CYCLE_S = 10;
const CIRCLE_SIZE = 150;
const CIRCLE_MIN_SCALE = 0.82;

/** Small selectable pill for the duration and tone choices */
function Choice({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`flex-row items-center gap-1.5 px-3.5 h-10 rounded-full border ${
        selected ? 'bg-primary-soft border-primary' : 'bg-surface border-border-strong'
      }`}
    >
      {icon}
      <Text className={`text-sm ${selected ? 'font-bold text-primary-ink' : 'font-semibold text-body'}`}>{label}</Text>
    </Pressable>
  );
}

/**
 * An urge timer with a breathing circle, shown at the top of Emergency Help.
 * The person picks how long and which tone plays at the end; both are remembered.
 * Its 1 s tick and animation run only while the timer is running and this screen is open.
 */
export function RideTheWave({ onLogWin }: RideTheWaveProps) {
  const reducedMotion = useReducedMotion();
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const [phase, setPhase] = useState<Phase>('idle');
  const [minutes, setMinutes] = useState<number>(DEFAULT_MINUTES);
  const [tone, setTone] = useState<ToneId>('chime');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [isSaving, setIsSaving] = useState(false);
  // One small player per tone, so a preview plays the moment it's tapped
  const chimePlayer = useAudioPlayer(TONES.chime.source);
  const bellPlayer = useAudioPlayer(TONES.bell.source);
  const softPlayer = useAudioPlayer(TONES.soft.source);
  const players = { chime: chimePlayer, bell: bellPlayer, soft: softPlayer, off: null };
  const runningRef = useRef(false);

  // Remembered choices
  useEffect(() => {
    (async () => {
      const [savedMinutes, savedTone] = await Promise.all([getAppSetting(MINUTES_KEY), getAppSetting(TONE_KEY)]);
      const m = Number(savedMinutes);
      if (DURATION_OPTIONS.includes(m as (typeof DURATION_OPTIONS)[number])) setMinutes(m);
      if (savedTone && savedTone in TONES) setTone(savedTone as ToneId);
    })();
    // Respect the ringer switch: a silenced phone only vibrates
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'duckOthers' }).catch(() => {});
  }, []);

  // Leaving the screen ends the timer, so its notification goes too
  useEffect(() => () => {
    if (runningRef.current) notificationService.cancelUrgeTimerEnd();
  }, []);

  useEffect(() => {
    if (phase !== 'running') return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const totalS = minutes * 60;
  const elapsedS = startedAt ? Math.floor((now - startedAt) / 1000) : 0;
  const remainingS = Math.max(0, totalS - elapsedS);
  const breathingIn = elapsedS % BREATH_CYCLE_S < BREATHE_IN_S;

  const stopTones = () => {
    chimePlayer.pause();
    bellPlayer.pause();
    softPlayer.pause();
  };

  const playTone = (id: ToneId) => {
    const player = players[id];
    if (!player) return;
    stopTones();
    player.seekTo(0).catch(() => {});
    player.play();
  };

  useEffect(() => {
    if (phase === 'running' && remainingS === 0 && startedAt) {
      runningRef.current = false;
      setPhase('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      notificationService.cancelUrgeTimerEnd();
      const endedAt = startedAt + totalS * 1000;
      if (Date.now() - endedAt < RING_WINDOW_MS) playTone(tone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, remainingS]);

  const scale = useSharedValue(CIRCLE_MIN_SCALE);
  useEffect(() => {
    if (phase === 'running' && !reducedMotion) {
      scale.value = CIRCLE_MIN_SCALE;
      scale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: BREATHE_IN_S * 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(CIRCLE_MIN_SCALE, { duration: (BREATH_CYCLE_S - BREATHE_IN_S) * 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
    } else {
      cancelAnimation(scale);
      scale.value = CIRCLE_MIN_SCALE;
    }
  }, [phase, reducedMotion, scale]);
  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const chooseMinutes = (m: number) => {
    Haptics.selectionAsync();
    setMinutes(m);
    setAppSetting(MINUTES_KEY, String(m));
  };

  const chooseTone = (id: ToneId) => {
    Haptics.selectionAsync();
    setTone(id);
    setAppSetting(TONE_KEY, id);
  };

  const start = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    stopTones();
    const t = Date.now();
    setStartedAt(t);
    setNow(t);
    setPhase('running');
    runningRef.current = true;
    if (tone !== 'off') notificationService.scheduleUrgeTimerEnd(new Date(t + minutes * 60 * 1000));
  };

  const reset = () => {
    if (runningRef.current) notificationService.cancelUrgeTimerEnd();
    runningRef.current = false;
    stopTones();
    setPhase('idle');
    setStartedAt(null);
  };

  const logWin = async () => {
    setIsSaving(true);
    try {
      await onLogWin(minutes);
      setPhase('logged');
    } catch {
      // The caller already told the person; stay on this step so they can retry
    } finally {
      setIsSaving(false);
    }
  };

  const mins = Math.floor(remainingS / 60);
  const secs = (remainingS % 60).toString().padStart(2, '0');

  return (
    <View style={cardShadow} className="rounded-[20px]">
    <View className="relative p-5 overflow-hidden border bg-surface border-border rounded-[20px]">
      {/* Faint background icon, so it never crowds the title */}
      <View className="absolute top-[-10px] right-[-16px] opacity-10" pointerEvents="none">
        <Waves size={120} color={colors.primary} strokeWidth={1.5} />
      </View>
      <Text className="text-lg font-bold text-fg">Ride the wave</Text>

      {phase === 'idle' && (
        <>
          <Text className="mt-1 text-sm leading-6 font-regular text-body">
            Urges rise, peak and fade. Breathe with the circle and let this one pass.
          </Text>

          <Text className="mt-4 mb-2 text-xs font-bold tracking-wide uppercase text-muted">How long</Text>
          <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup">
            {DURATION_OPTIONS.map((m) => (
              <Choice key={m} label={`${m} min`} selected={minutes === m} onPress={() => chooseMinutes(m)} />
            ))}
          </View>

          <Text className="mt-4 mb-2 text-xs font-bold tracking-wide uppercase text-muted">Sound when done</Text>
          <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup">
            {TONE_IDS.map((id) => (
              <Choice
                key={id}
                label={TONES[id].label}
                selected={tone === id}
                onPress={() => {
                  chooseTone(id);
                  playTone(id); // preview
                }}
                icon={
                  id === 'off'
                    ? <VolumeX size={15} color={tone === id ? colors.primaryInk : colors.muted} strokeWidth={2.5} />
                    : tone === id
                      ? <Volume2 size={15} color={colors.primaryInk} strokeWidth={2.5} />
                      : undefined
                }
              />
            ))}
          </View>

          <Pressable
            onPress={start}
            accessibilityRole="button"
            className="items-center py-3 mt-5 rounded-xl bg-primary active:bg-primary-ink"
          >
            <Text className="text-base font-bold text-primary-on">Start {minutes}-minute timer</Text>
          </Pressable>
        </>
      )}

      {phase === 'running' && (
        <View className="items-center mt-4">
          <View style={{ width: CIRCLE_SIZE + 24, height: CIRCLE_SIZE + 24 }} className="items-center justify-center">
            <Reanimated.View
              style={[{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2 }, circleStyle]}
              className="absolute bg-primary/25"
            />
            <View
              accessible
              accessibilityRole="timer"
              accessibilityLabel={`${mins} minutes ${remainingS % 60} seconds left. ${breathingIn ? 'Breathe in' : 'Breathe out'}`}
              className="items-center"
            >
              <Text className="text-3xl font-bold text-fg">
                {mins}:{secs}
              </Text>
              <Text className="text-sm font-semibold text-primary-ink">
                {breathingIn ? 'Breathe in' : 'Breathe out'}
              </Text>
            </View>
          </View>
          <Text className="font-regular text-xs text-muted">
            {tone === 'off' ? 'No sound at the end' : `${TONES[tone].label} plays at the end`}
          </Text>
          <Pressable onPress={reset} accessibilityRole="button" className="px-4 py-2 mt-2" hitSlop={8}>
            <Text className="text-sm font-semibold text-primary-ink">Stop</Text>
          </Pressable>
        </View>
      )}

      {phase === 'done' && (
        <>
          <Text className="mt-1 text-base font-semibold text-fg">
            You rode it out for {minutes} minutes. Log it as a win?
          </Text>
          <View className="flex-row gap-3 mt-4">
            <Pressable
              onPress={logWin}
              disabled={isSaving}
              accessibilityRole="button"
              className="items-center flex-1 py-3 rounded-xl bg-primary active:bg-primary-ink"
            >
              <Text className="text-base font-bold text-primary-on">{isSaving ? 'Saving…' : 'Log win'}</Text>
            </Pressable>
            <Pressable
              onPress={reset}
              accessibilityRole="button"
              className="items-center flex-1 py-3 border bg-surface rounded-xl border-border-strong"
            >
              <Text className="text-base font-bold text-primary-ink">Not now</Text>
            </Pressable>
          </View>
        </>
      )}

      {phase === 'logged' && (
        <Text className="mt-1 text-base font-semibold text-body">
          Logged as a 🧘 Mindfulness win. Well done.
        </Text>
      )}
    </View>
    </View>
  );
}
