import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface VoiceControlsProps {
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  onDestroy: () => void;
  isListening?: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  onStart,
  onStop,
  onCancel,
  onDestroy,
  isListening = false,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.mainButton, isListening && styles.listeningButton]}
        onPress={onStart}
        activeOpacity={0.8}
      >
        <Text style={[styles.mainButtonText, isListening && styles.listeningButtonText]}>
          {isListening ? '🎤 Listening...' : '🎤 Start Recording'}
        </Text>
      </TouchableOpacity>

      <View style={styles.secondaryButtons}>
        <TouchableOpacity style={styles.secondaryButton} onPress={onStop} activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>⏹ Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>❌ Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.destroyButton} onPress={onDestroy} activeOpacity={0.7}>
          <Text style={styles.destroyButtonText}>🗑 Destroy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listeningButton: {
    backgroundColor: '#dc3545',
    transform: [{ scale: 1.05 }],
  },
  mainButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listeningButtonText: {
    color: '#ffffff',
  },
  secondaryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  destroyButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  destroyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 