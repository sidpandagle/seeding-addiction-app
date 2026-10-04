import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import { palette } from '../../constants/palette';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error info:', errorInfo.componentStack);
    }
  }

  handleRestart = (): void => {
    // Reset error state to attempt re-render
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      const colors = palette[useThemeStore.getState().colorScheme];
      return (
        <View className="items-center justify-center flex-1 px-6 bg-bg">
          <View className="items-center justify-center w-20 h-20 mb-6 bg-urge-soft rounded-full">
            <AlertTriangle size={40} color={colors.urge} strokeWidth={2} />
          </View>

          <Text className="mb-2 text-2xl font-bold text-center text-fg">
            Something went wrong
          </Text>

          <Text className="font-regular mb-6 text-base text-center text-muted">
            The app encountered an unexpected error. Please restart to continue.
          </Text>

          {__DEV__ && this.state.error && (
            <View className="w-full p-4 mb-6 bg-subtle rounded-xl">
              <Text className="mb-1 text-xs font-semibold text-muted">
                DEBUG INFO:
              </Text>
              <Text className="font-regular text-xs text-urge">
                {this.state.error.message}
              </Text>
            </View>
          )}

          <Pressable
            onPress={this.handleRestart}
            className="flex-row items-center gap-2 px-6 py-3 bg-primary rounded-xl active:bg-primary-ink"
          >
            <RefreshCw size={20} color={colors.onPrimary} strokeWidth={2} />
            <Text className="text-base font-semibold text-primary-on">
              Try Again
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
