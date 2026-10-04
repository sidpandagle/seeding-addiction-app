import { View, Text, Pressable, ScrollView, Switch, Modal, Linking, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, type ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import {
  isBiometricAvailable,
  isAppLockEnabled,
  setAppLockEnabled,
  authenticateUser,
  getAuthenticationMethodName,
} from '../../src/services/security';
import { useRelapseStore } from '../../src/stores/relapseStore';
import { useColorScheme, useThemeStore } from '../../src/stores/themeStore';
import { useNotificationStore } from '../../src/stores/notificationStore';
import { useReducedMotion } from '../../src/hooks/useReducedMotion';
import { useThemeColors, useCardShadow } from '../../src/hooks/useThemeColors';
import { STAGE_TINT_FAMILIES } from '../../src/constants/palette';
import { Settings2, Lock, Sun, Moon, Trash2, Brain, Coffee, BookOpen, Bell, Clock, Sparkles, Trophy, Sheet, Star, Leaf, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { exportService } from '../../src/services/exportService';
import { rateApp } from '../../src/services/rateApp';
import { APP_VERSION } from '../../src/constants/appInfo';
import AppIcon from '../../src/components/common/AppIcon';
import RecoveryEducationModal from '../../src/components/modals/RecoveryEducationModal';
import CustomAlert from '../../src/components/common/CustomAlert';
import ConfirmationDialog from '../../src/components/common/ConfirmationDialog';
import { useAlert } from '../../src/hooks/useAlert';
import HowToUseModal from '../../src/components/modals/HowToUseModal';
import AboutModal from '../../src/components/modals/AboutModal';
import DateTimePicker from '@react-native-community/datetimepicker';

// Light thumb on the off track, in both modes
const SWITCH_THUMB_OFF = '#EBEFE6';

/** A titled card that holds a group of rows */
function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  const cardShadow = useCardShadow();
  return (
    <View className="px-6 mt-6">
      <Text className="mb-2 ml-1 text-xs font-bold tracking-widest uppercase text-muted">{title}</Text>
      <View style={cardShadow} className="rounded-[20px]">
        <View className="overflow-hidden border bg-surface border-border rounded-[20px]">{children}</View>
      </View>
    </View>
  );
}

interface SettingsRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Switch or other control on the right; rows with onPress and no right show a chevron */
  right?: ReactNode;
  onPress?: () => void;
  danger?: boolean;
  /** First row in its group: no divider above */
  first?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

/** One settings row: sage icon circle, title, subtitle and a switch or chevron */
function SettingsRow({ icon: Icon, title, subtitle, right, onPress, danger, first, disabled, children }: SettingsRowProps) {
  const colors = useThemeColors();
  const content = (
    <>
      <View className={`items-center justify-center w-9 h-9 rounded-full ${danger ? 'bg-urge-soft' : 'bg-primary-soft'}`}>
        <Icon size={19} color={danger ? colors.urge : colors.primary} strokeWidth={2.25} />
      </View>
      <View className="flex-1">
        <Text className={`text-base font-bold ${danger ? 'text-urge' : 'text-fg'}`}>{title}</Text>
        {subtitle ? <Text className="font-regular text-sm text-muted">{subtitle}</Text> : null}
        {children}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color={danger ? colors.urge : colors.faint} strokeWidth={2.5} /> : null)}
    </>
  );
  const rowClass = `flex-row items-center gap-3 px-4 py-3 min-h-[64px] ${first ? '' : 'border-t border-border'} ${disabled ? 'opacity-50' : ''}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" className={`${rowClass} active:bg-subtle`}>
        {content}
      </Pressable>
    );
  }
  return <View className={rowClass}>{content}</View>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const cardShadow = useCardShadow();
  const stageTint = useThemeStore((state) => state.stageTint);
  const setStageTint = useThemeStore((state) => state.setStageTint);
  const reducedMotion = useReducedMotion();
  const resetAllData = useRelapseStore((state) => state.resetAllData);
  const [appLockEnabled, setAppLockEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [authMethodName, setAuthMethodName] = useState('Biometric');
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showHowToUseModal, setShowHowToUseModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isRatingInProgress, setIsRatingInProgress] = useState(false);

  // Notification state
  const {
    isInitialized: notificationsInitialized,
    isEnabled: notificationsEnabled,
    dailyReminderTime,
    randomNotificationsEnabled,
    milestoneNotificationsEnabled,
    initialize: initializeNotifications,
    setEnabled: setNotificationsEnabled,
    setDailyReminder,
    clearDailyReminder,
    setRandomNotifications,
    setMilestoneNotifications,
  } = useNotificationStore();

  // Alert state
  const { alertState, showAlert, hideAlert } = useAlert();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const switchColors = (on: boolean) => ({
    trackColor: { false: colors.borderStrong, true: colors.primary },
    thumbColor: on ? '#FFFFFF' : SWITCH_THUMB_OFF,
  });

  const handleThemeChange = (theme: 'light' | 'dark') => {
    if (theme === colorScheme) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Change theme (triggers transition overlay)
    useThemeStore.getState().setColorScheme(theme);
  };

  useEffect(() => {
    const loadSecuritySettings = async () => {
      const lockEnabled = await isAppLockEnabled();
      const bioAvailable = await isBiometricAvailable();
      const methodName = await getAuthenticationMethodName();

      setAppLockEnabledState(lockEnabled);
      setBiometricAvailable(bioAvailable);
      setAuthMethodName(methodName);
    };

    loadSecuritySettings();
    initializeNotifications();
  }, []);

  const handleAppLockToggle = async (value: boolean) => {
    try {
      if (value) {
        // Enabling lock - verify biometric is available
        if (!biometricAvailable) {
          showAlert({
            type: 'info',
            title: 'Biometric Not Available',
            message: 'Your device does not have biometric authentication set up. Please enable Face ID, Touch ID, or fingerprint authentication in your device settings.',
            buttons: [{ text: 'OK', onPress: hideAlert }],
            dismissOnBackdrop: true,
          });
          return;
        }

        // Ask user to authenticate before enabling
        const authenticated = await authenticateUser('Authenticate to enable app lock');
        if (!authenticated) {
          showAlert({
            type: 'error',
            title: 'Authentication Failed',
            message: 'Could not enable app lock.',
            buttons: [{ text: 'OK', onPress: hideAlert }],
          });
          return;
        }

        await setAppLockEnabled(true);
        setAppLockEnabledState(true);
        showAlert({
          type: 'success',
          title: 'App Lock Enabled',
          message: `${authMethodName} protection is now active. You'll need to authenticate when opening the app.`,
          buttons: [{ text: 'OK', onPress: hideAlert }],
        });
      } else {
        // Disabling lock - require authentication first
        const authenticated = await authenticateUser('Authenticate to disable app lock');
        if (!authenticated) {
          showAlert({
            type: 'error',
            title: 'Authentication Failed',
            message: 'Could not disable app lock.',
            buttons: [{ text: 'OK', onPress: hideAlert }],
          });
          return;
        }

        await setAppLockEnabled(false);
        setAppLockEnabledState(false);
        showAlert({
          type: 'success',
          title: 'App Lock Disabled',
          message: 'App lock has been turned off.',
          buttons: [{ text: 'OK', onPress: hideAlert }],
        });
      }
    } catch (error) {
      console.error('Error toggling app lock:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Could not update app lock setting.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  const handleResetData = () => {
    setShowConfirmDialog(true);
  };

  const confirmResetData = async () => {
    try {
      // Reset database
      await resetAllData();
      setShowConfirmDialog(false);
      router.replace('/');
    } catch (error) {
      console.error('Error resetting data:', error);
      setShowConfirmDialog(false);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Could not reset data. Please try again.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  const handleBuyMeCoffee = async () => {
    const url = 'https://buymeacoffee.com/sidp'; // Replace with your actual Buy Me a Coffee URL

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: 'Unable to open link. Please try again later.',
          buttons: [{ text: 'OK', onPress: hideAlert }],
        });
      }
    } catch (error) {
      console.error('Error opening Buy Me a Coffee:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Could not open support page.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    await setNotificationsEnabled(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDailyReminderToggle = async (value: boolean) => {
    if (value) {
      setShowTimePicker(true);
    } else {
      await clearDailyReminder();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleTimeSelected = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedDate) {
      const hour = selectedDate.getHours();
      const minute = selectedDate.getMinutes();
      await setDailyReminder(hour, minute);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleRandomNotificationsToggle = async (value: boolean) => {
    await setRandomNotifications(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleMilestoneNotificationsToggle = async (value: boolean) => {
    await setMilestoneNotifications(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatReminderTime = (time: { hour: number; minute: number } | null) => {
    if (!time) return 'Not set';
    const period = time.hour >= 12 ? 'PM' : 'AM';
    const displayHour = time.hour % 12 || 12;
    const displayMinute = time.minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const handleExportXLSX = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await exportService.exportToXLSX();

    // Only show error alert if export failed
    // Don't show success alert since the share sheet itself provides feedback
    if (!success) {
      showAlert({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not export to Excel. Please try again.',
        buttons: [{ text: 'OK', onPress: hideAlert }],
      });
    }
  };

  const handleRateApp = async () => {
    if (isRatingInProgress) return;

    setIsRatingInProgress(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const opened = await rateApp();
      if (!opened) {
        const storeName = Platform.OS === 'android' ? 'Play Store' : 'App Store';
        showAlert({
          type: 'info',
          title: 'Rating Not Available',
          message: `Couldn't open the ${storeName}. You can rate Seeding by searching for it in the ${storeName}.`,
          buttons: [{ text: 'Got it', onPress: hideAlert }],
          dismissOnBackdrop: true,
        });
      }
    } finally {
      // Brief lockout so a double tap doesn't open the store twice
      setTimeout(() => setIsRatingInProgress(false), 1500);
    }
  };


  return (
    <View className="flex-1 bg-bg">
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {/* Elegant Header */}
      <View className="pt-16 pb-6">
        <View className="px-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-3xl font-semibold tracking-wide text-fg">
                Settings
              </Text>
              <Text className="mt-1 text-sm font-medium tracking-wide text-muted">
                Customize your experience
              </Text>
            </View>
            <View className="items-center justify-center bg-plum-soft w-14 h-14 rounded-2xl">
              <Settings2 size={26} color={colors.plum} strokeWidth={2.5} />
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
      >
        <SettingsGroup title="Appearance">
          <View className="gap-3 px-4 pt-3.5 pb-3">
            <Text className="text-base font-bold text-fg">Theme</Text>
            <View className="flex-row gap-1 p-1 rounded-2xl bg-subtle" accessibilityRole="radiogroup">
              {([
                { value: 'light', label: 'Light', Icon: Sun },
                { value: 'dark', label: 'Dark', Icon: Moon },
              ] as const).map(({ value, label, Icon }) => {
                const selected = colorScheme === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => handleThemeChange(value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    style={selected ? cardShadow : undefined}
                    className={`flex-row items-center justify-center flex-1 h-11 gap-2 rounded-xl ${selected ? 'bg-surface' : ''}`}
                  >
                    <Icon size={18} color={selected ? colors.primary : colors.muted} strokeWidth={2.5} />
                    <Text className={`text-base ${selected ? 'font-bold text-fg' : 'font-semibold text-muted'}`}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          {/* Stage colors: tints the Home timer card with the current growth stage */}
          <SettingsRow
            icon={Leaf}
            title="Stage colors"
            subtitle="Tint the timer card with your growth stage"
            right={
              <Switch
                value={stageTint}
                onValueChange={setStageTint}
                accessibilityLabel="Stage colors"
                {...switchColors(stageTint)}
              />
            }
          >
            <View className="flex-row gap-1 mt-1.5">
              {STAGE_TINT_FAMILIES.map((family) => (
                <View
                  key={family.name}
                  style={{ width: 22, height: 8, borderRadius: 4, backgroundColor: family.color }}
                />
              ))}
            </View>
          </SettingsRow>
        </SettingsGroup>

        <SettingsGroup title="Notifications">
          <SettingsRow
            first
            icon={Bell}
            title="Notifications"
            subtitle={notificationsInitialized ? 'Reminders & motivation' : 'Setting up...'}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                disabled={!notificationsInitialized}
                accessibilityLabel="Notifications"
                {...switchColors(notificationsEnabled)}
              />
            }
          />
          <SettingsRow
            icon={Clock}
            title="Daily reminder"
            subtitle={formatReminderTime(dailyReminderTime)}
            disabled={!notificationsEnabled}
            right={
              <Switch
                value={!!dailyReminderTime}
                onValueChange={handleDailyReminderToggle}
                disabled={!notificationsEnabled}
                accessibilityLabel="Daily reminder"
                {...switchColors(!!dailyReminderTime)}
              />
            }
          />
          <SettingsRow
            icon={Sparkles}
            title="Random motivation"
            subtitle="Encouraging messages through the day"
            disabled={!notificationsEnabled}
            right={
              <Switch
                value={randomNotificationsEnabled}
                onValueChange={handleRandomNotificationsToggle}
                disabled={!notificationsEnabled}
                accessibilityLabel="Random motivation"
                {...switchColors(randomNotificationsEnabled)}
              />
            }
          />
          <SettingsRow
            icon={Trophy}
            title="Milestone alerts"
            subtitle="When you're close to an achievement"
            disabled={!notificationsEnabled}
            right={
              <Switch
                value={milestoneNotificationsEnabled}
                onValueChange={handleMilestoneNotificationsToggle}
                disabled={!notificationsEnabled}
                accessibilityLabel="Milestone alerts"
                {...switchColors(milestoneNotificationsEnabled)}
              />
            }
          />
        </SettingsGroup>

        <SettingsGroup title="Privacy & data">
          <SettingsRow
            first
            icon={Lock}
            title="App lock"
            subtitle={biometricAvailable ? `Protect with ${authMethodName}` : 'Not available on this device'}
            right={
              <Switch
                value={appLockEnabled}
                onValueChange={handleAppLockToggle}
                disabled={!biometricAvailable}
                accessibilityLabel="App lock"
                {...switchColors(appLockEnabled)}
              />
            }
          />
          <SettingsRow
            icon={Sheet}
            title="Export to Excel"
            subtitle="Journey, badges, charts & insights"
            onPress={handleExportXLSX}
          />
          <SettingsRow
            icon={Trash2}
            title="Reset all data"
            subtitle="Permanently delete all records"
            onPress={handleResetData}
            danger
          />
        </SettingsGroup>

        <SettingsGroup title="Learn">
          <SettingsRow
            first
            icon={BookOpen}
            title="How to use Seeding"
            subtitle="Features & tracking"
            onPress={() => setShowHowToUseModal(true)}
          />
          <SettingsRow
            icon={Brain}
            title="Understanding recovery"
            subtitle="The dopamine science"
            onPress={() => setShowEducationModal(true)}
          />
        </SettingsGroup>

        <SettingsGroup title="Support">
          <SettingsRow
            first
            icon={Star}
            title="Rate this app"
            subtitle={isRatingInProgress ? 'Opening...' : 'Share feedback on the app store'}
            onPress={handleRateApp}
            disabled={isRatingInProgress}
            right={isRatingInProgress ? <ActivityIndicator size="small" color={colors.primary} /> : undefined}
          />
          <SettingsRow
            icon={Coffee}
            title="Buy me a coffee"
            subtitle="Support the development"
            onPress={handleBuyMeCoffee}
          />
        </SettingsGroup>

        {/* App info footer */}
        <Pressable
          onPress={() => setShowAboutModal(true)}
          accessibilityRole="button"
          accessibilityLabel="About Seeding and FAQ"
          className="items-center gap-1 px-6 mt-8 active:opacity-70"
        >
          <AppIcon size={44} />
          <Text className="mt-1.5 text-sm font-bold text-muted">
            Seeding · Version {APP_VERSION}
          </Text>
          <Text className="font-regular text-xs text-muted">Privacy-focused relapse tracking</Text>
          <Text className="mt-1.5 text-sm font-bold text-primary">About & FAQ</Text>
        </Pressable>
      </ScrollView>

      {/* Recovery Education Modal */}
      <Modal
        visible={showEducationModal}
        animationType={reducedMotion ? 'none' : 'slide'}
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEducationModal(false)}
      >
        <RecoveryEducationModal onClose={() => setShowEducationModal(false)} />
      </Modal>

      {/* How to Use Modal */}
      <Modal
        visible={showHowToUseModal}
        animationType={reducedMotion ? 'none' : 'slide'}
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHowToUseModal(false)}
      >
        <HowToUseModal onClose={() => setShowHowToUseModal(false)} />
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        animationType={reducedMotion ? 'none' : 'slide'}
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <AboutModal onClose={() => setShowAboutModal(false)} />
      </Modal>

      {/* Custom Alert */}
      {alertState && (
        <CustomAlert
          visible={alertState.visible}
          type={alertState.type}
          title={alertState.title}
          message={alertState.message}
          buttons={alertState.buttons}
          onDismiss={hideAlert}
          dismissOnBackdrop={alertState.dismissOnBackdrop}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        visible={showConfirmDialog}
        title="Reset All Data"
        message="This will permanently delete all your relapse records and journey start date. This action cannot be undone."
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={confirmResetData}
        onCancel={() => setShowConfirmDialog(false)}
        isDestructive={true}
      />

      {/* Time Picker for Daily Reminder */}
      {showTimePicker && (
        <DateTimePicker
          value={dailyReminderTime
            ? new Date(new Date().setHours(dailyReminderTime.hour, dailyReminderTime.minute, 0, 0))
            : new Date(new Date().setHours(9, 0, 0, 0))
          }
          mode="time"
          is24Hour={false}
          display="spinner"
          onChange={handleTimeSelected}
        />
      )}
    </View>
  );
}
