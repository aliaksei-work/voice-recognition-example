import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {AppMode} from './ModeSelector';
import {VoiceControls} from '../../voiceTest/components/VoiceControls';

interface BottomBarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onStart: () => void;
  onStop: () => void;
  isListening: boolean;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  currentMode,
  onModeChange,
  onStart,
  onStop,
  isListening,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.modeButton, currentMode === 'add' && styles.activeMode]}
        onPress={() => onModeChange('add')}>
        <Text style={[styles.modeText, currentMode === 'add' && styles.activeModeText]}>
          Добавить трату
        </Text>
      </TouchableOpacity>

      <View style={styles.voiceControlsContainer}>
        <VoiceControls
          onStart={onStart}
          onStop={onStop}
          isListening={isListening}
        />
      </View>

      <TouchableOpacity
        style={[styles.modeButton, currentMode === 'history' && styles.activeMode]}
        onPress={() => onModeChange('history')}>
        <Text
          style={[styles.modeText, currentMode === 'history' && styles.activeModeText]}>
          История
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeMode: {
    backgroundColor: '#00e6d6',
  },
  modeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  activeModeText: {
    color: '#004953',
  },
  voiceControlsContainer: {
    position: 'relative',
    top: -20,
  },
}); 