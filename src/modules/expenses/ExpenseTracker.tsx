import React, {useState} from 'react';
import {StyleSheet, ScrollView, SafeAreaView, View} from 'react-native';
import {
  useVoiceRecognition,
  Language,
} from '../voiceTest/hooks/useVoiceRecognition';
import {useListeningState} from '../voiceTest/hooks/useListeningState';
import {VoiceHeader} from '../voiceTest/components/VoiceHeader';
import {VoiceStatus} from '../voiceTest/components/VoiceStatus';
import {VoiceControls} from '../voiceTest/components/VoiceControls';
import {LanguageSelector} from '../voiceTest/components/LanguageSelector';
import {useExpenses} from './hooks/useExpenses';
import {useVoiceExpenseRecognition} from './hooks/useVoiceExpenseRecognition';
import {ExpensesList} from './components/ExpensesList';
import {ProcessingStatus} from './components/ProcessingStatus';
import {ExpenseStats} from './components/ExpenseStats';
import {ExpenseHistory} from './components/ExpenseHistory';
import {ModeSelector, AppMode} from './components/ModeSelector';

const ExpenseTracker: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ru-RU');
  const [currentMode, setCurrentMode] = useState<AppMode>('add');

  const {state, startRecognizing, stopRecognizing} =
    useVoiceRecognition(selectedLanguage);

  const {isListening, hasResults, hasError} = useListeningState(state);

  const {
    expenses,
    addExpense,
    removeExpense,
    clearExpenses,
    getExpensesByCategory,
    getCategoryTotal,
    getCategoryDateTotal,
    getCategories,
  } = useExpenses();

  const {processVoiceInput, isProcessing, processingError} =
    useVoiceExpenseRecognition(addExpense);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
  };

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handleVoiceResult = async (text: string) => {
    await processVoiceInput(text);
  };

  const renderAddMode = () => (
    <>
      <LanguageSelector
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        isListening={isListening}
      />

      <VoiceControls
        onStart={startRecognizing}
        onStop={stopRecognizing}
        isListening={isListening}
      />

      {(hasResults || hasError || isListening) && (
        <VoiceStatus state={state} onResult={handleVoiceResult} />
      )}

      {isProcessing && <ProcessingStatus />}

      {processingError && (
        <View style={styles.errorContainer}>
          <ProcessingStatus error={processingError} />
        </View>
      )}

      {expenses.length > 0 && (
        <>
          <ExpenseStats
            expenses={expenses}
          />
          <ExpensesList
            expenses={expenses.slice(0, 5)}
            onRemoveExpense={removeExpense}
            onClearAll={clearExpenses}
          />
        </>
      )}
    </>
  );

  const renderHistoryMode = () => (
    <ExpenseHistory
      expenses={expenses}
      getExpensesByCategory={getExpensesByCategory}
      getCategoryTotal={getCategoryTotal}
      getCategoryDateTotal={getCategoryDateTotal}
      getCategories={getCategories}
      onRemoveExpense={removeExpense}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <VoiceHeader />

      <ModeSelector
        currentMode={currentMode}
        onModeChange={handleModeChange}
      />

      {currentMode === 'add' ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {renderAddMode()}
        </ScrollView>
      ) : (
        <View style={styles.historyContainer}>
          {renderHistoryMode()}
        </View>
      )}
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
  errorContainer: {
    marginTop: 16,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default ExpenseTracker;
