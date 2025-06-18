import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type AppMode = 'add' | 'history';

interface ModeSelectorProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, currentMode === 'add' && styles.activeTab]}
        onPress={() => onModeChange('add')}
      >
        <Text style={[styles.tabText, currentMode === 'add' && styles.activeTabText]}>
          🎤 Добавить трату
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, currentMode === 'history' && styles.activeTab]}
        onPress={() => onModeChange('history')}
      >
        <Text style={[styles.tabText, currentMode === 'history' && styles.activeTabText]}>
          📋 История
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#2c3e50',
    fontWeight: '600',
  },
}); 