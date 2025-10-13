import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';

interface ModalErrorFallbackProps {
  onClose: () => void;
  error?: Error;
}

/**
 * Error fallback UI for modals
 * Provides a user-friendly error message with a close button
 */
export default function ModalErrorFallback({ onClose, error }: ModalErrorFallbackProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 bg-white dark:bg-gray-900">
      <View className="items-center max-w-md">
        <View className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
          <AlertTriangle size={48} color="#ef4444" strokeWidth={2} />
        </View>
        
        <Text className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
          Something went wrong
        </Text>
        
        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center leading-relaxed">
          An unexpected error occurred. Please close this and try again.
        </Text>

        {__DEV__ && error && (
          <View className="w-full mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl max-h-32">
            <Text className="text-xs font-mono text-red-600 dark:text-red-400">
              {error.toString()}
            </Text>
          </View>
        )}

        <Pressable
          onPress={onClose}
          className="flex-row items-center justify-center px-6 py-4 bg-red-500 dark:bg-red-600 rounded-2xl active:bg-red-600 dark:active:bg-red-700"
        >
          <X size={20} color="#FFFFFF" strokeWidth={2.2} />
          <Text className="ml-2 text-base font-semibold text-white">
            Close
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
