import React, { useState } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View, Text } from 'react-native';
import { useVoiceExpenseRecognition } from './hooks/useVoiceExpenseRecognition';
import { useExpenses } from './hooks/useExpenses';
import { VoiceControls } from '../voiceTest/components/VoiceControls';
import { LanguageSelector } from '../voiceTest/components/LanguageSelector';
import { ExpensesList } from './components/ExpensesList';
import { ProcessingStatus } from './components/ProcessingStatus';
import { Language } from '../voiceTest/hooks/useVoiceRecognition';

const ExpenseTracker: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ru-RU');

  const {
    isListening,
    isProcessing,
    recognizedText,
    error,
    lastExpense,
    startRecording,
    stopRecording,
  } = useVoiceExpenseRecognition(selectedLanguage);

  const { expenses, removeExpense } = useExpenses();

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = async () => {
    await stopRecording();
  };

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Учет расходов</Text>
          <Text style={styles.subtitle}>Говорите и записывайте траты</Text>
        </View>

        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
          isListening={isListening}
        />

        <VoiceControls
          onStart={handleStartRecording}
          onStop={handleStopRecording}
          isListening={isListening}
        />

        <ProcessingStatus
          isProcessing={isProcessing}
          recognizedText={recognizedText}
          error={error}
          lastExpense={lastExpense}
        />

        <ExpensesList
          expenses={expenses}
          onRemoveExpense={removeExpense}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 20,
  },
  header: {
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

export default ExpenseTracker; 