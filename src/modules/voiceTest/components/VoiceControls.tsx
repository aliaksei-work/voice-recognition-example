import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface VoiceControlsProps {
  onStart: () => void;
  onStop: () => void;
  isListening?: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  onStart,
  onStop,
  isListening = false,
}) => {
  const handlePress = () => {
    if (isListening) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.mainButton, isListening && styles.listeningButton]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={[styles.mainButtonText, isListening && styles.listeningButtonText]}>
          {isListening ? '⏹ Stop Recording' : '🎤 Start Recording'}
        </Text>
      </TouchableOpacity>
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
}); 