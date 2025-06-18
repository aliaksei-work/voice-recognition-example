import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export interface ProcessingStatusProps {
  isProcessing?: boolean;
  error?: string | null;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  isProcessing = false,
  error = null,
}) => {
  if (isProcessing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#2196f3" />
        <Text style={styles.processingText}>Обрабатываю трату...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>❌ Ошибка: {error}</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 8,
  },
  processingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2196f3',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '500',
  },
}); 