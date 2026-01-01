import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

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
      return (
        <View className="items-center justify-center flex-1 px-6 bg-gray-50 dark:bg-gray-950">
          <View className="items-center justify-center w-20 h-20 mb-6 bg-red-100 rounded-full dark:bg-red-900/30">
            <AlertTriangle size={40} color="#ef4444" strokeWidth={2} />
          </View>

          <Text className="mb-2 text-2xl font-bold text-center text-gray-900 dark:text-white">
            Something went wrong
          </Text>

          <Text className="mb-6 text-base text-center text-gray-600 dark:text-gray-400">
            The app encountered an unexpected error. Please restart to continue.
          </Text>

          {__DEV__ && this.state.error && (
            <View className="w-full p-4 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <Text className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                DEBUG INFO:
              </Text>
              <Text className="text-xs text-red-600 dark:text-red-400">
                {this.state.error.message}
              </Text>
            </View>
          )}

          <Pressable
            onPress={this.handleRestart}
            className="flex-row items-center gap-2 px-6 py-3 bg-emerald-600 rounded-xl active:bg-emerald-700"
          >
            <RefreshCw size={20} color="#ffffff" strokeWidth={2} />
            <Text className="text-base font-semibold text-white">
              Try Again
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
