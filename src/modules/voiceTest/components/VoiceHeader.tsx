import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const VoiceHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎤 Voice Recognition</Text>
      <Text style={styles.subtitle}>
        Select language and start speaking to test voice recognition
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
}); 