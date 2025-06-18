import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VoiceState } from '../hooks/useVoiceRecognition';

interface VoiceStatusProps {
  state: VoiceState;
}

export const VoiceStatus: React.FC<VoiceStatusProps> = ({ state }) => {
  const { started, recognized, volume, error, end, results, partialResults } = state;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Recognition Status</Text>
      
      <View style={styles.statusGrid}>
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, started ? styles.active : styles.inactive]}>
            Started: {started || '○'}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, recognized ? styles.active : styles.inactive]}>
            Recognized: {recognized || '○'}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, end ? styles.active : styles.inactive]}>
            End: {end || '○'}
          </Text>
        </View>
        
        {volume && (
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Volume: {volume}</Text>
          </View>
        )}
        
        {error && (
          <View style={styles.statusItem}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}
      </View>

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Final Results:</Text>
          {results.map((result, index) => (
            <Text key={`result-${index}`} style={styles.resultText}>
              {result}
            </Text>
          ))}
        </View>
      )}

      {partialResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Partial Results:</Text>
          {partialResults.map((result, index) => (
            <Text key={`partial-result-${index}`} style={styles.partialResultText}>
              {result}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#2c3e50',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusItem: {
    minWidth: '48%',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  active: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  inactive: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  resultText: {
    fontSize: 14,
    color: '#28a745',
    backgroundColor: '#d4edda',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  partialResultText: {
    fontSize: 14,
    color: '#856404',
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
}); 