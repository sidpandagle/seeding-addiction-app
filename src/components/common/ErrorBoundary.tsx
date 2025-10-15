import React, { Component, ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches React component errors and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <View className="flex-1 items-center justify-center px-6 bg-neutral-50 dark:bg-[#1A1825]">
          <View className="items-center max-w-md">
            <View className="mb-6 p-4 bg-warm-100 dark:bg-warm-900/30 rounded-full">
              <AlertTriangle size={48} color="#E89463" strokeWidth={2} />
            </View>
            
            <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2 text-center">
              Something went wrong
            </Text>
            
            <Text className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 text-center leading-relaxed">
              We encountered an unexpected error. Don't worry, your data is safe. Try restarting the app.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView className="w-full mb-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl max-h-40">
                <Text className="text-xs font-mono text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-2">
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            <Pressable
              onPress={this.handleReset}
              className="flex-row items-center justify-center px-6 py-4 bg-primary-500 dark:bg-primary-600 rounded-2xl active:bg-primary-600 dark:active:bg-primary-700"
            >
              <RefreshCw size={20} color="#FFFFFF" strokeWidth={2.2} />
              <Text className="ml-2 text-base font-semibold text-white">
                Try Again
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
