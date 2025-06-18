import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VoiceState } from '../hooks/useVoiceRecognition';

export interface VoiceStatusProps {
  state: VoiceState;
  onResult?: (text: string) => void;
}

export const VoiceStatus: React.FC<VoiceStatusProps> = ({ state, onResult }) => {
  const { started, results, error } = state;

  useEffect(() => {
    // Process results when we have them and recognition is not active
    if (results.length > 0 && onResult && !started) {
      const result = results[0];
      if (result && result.trim()) {
        onResult(result);
      }
    }
  }, [results, onResult, started]);

  if (started) {
    return (
      <View style={styles.container}>
        <Text style={styles.status}>🎤 Слушаю...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>❌ Ошибка: {error}</Text>
      </View>
    );
  }

  if (results.length > 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.result}>✅ Распознано: {results[0]}</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 8,
  },
  status: {
    fontSize: 16,
    color: '#2196f3',
    textAlign: 'center',
    fontWeight: '500',
  },
  error: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    fontWeight: '500',
  },
  result: {
    fontSize: 16,
    color: '#4caf50',
    textAlign: 'center',
    fontWeight: '500',
  },
}); 