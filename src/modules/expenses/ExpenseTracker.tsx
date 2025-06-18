import React, {useState} from 'react';
import {StyleSheet, ScrollView, SafeAreaView, View, ActivityIndicator, Text} from 'react-native';
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
import {SpreadsheetLink} from './components/SpreadsheetLink';
import { useSpreadsheetId } from './hooks/useSpreadsheetId';
import { useCreateSpreadsheet } from './hooks/useCreateSpreadsheet';

interface ExpenseTrackerProps {
  googleAccessToken?: string;
  spreadsheetId?: string;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ googleAccessToken, spreadsheetId: propSpreadsheetId }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ru-RU');
  const [currentMode, setCurrentMode] = useState<AppMode>('add');

  const { spreadsheetId, setSpreadsheetId, loading: idLoading } = useSpreadsheetId();
  const { createSpreadsheet, loading: createLoading, error: createError } = useCreateSpreadsheet(googleAccessToken);

  React.useEffect(() => {
    if (!idLoading && !spreadsheetId && googleAccessToken) {
      (async () => {
        const created = await createSpreadsheet();
        if (created?.spreadsheetId) {
          setSpreadsheetId(created.spreadsheetId);
        }
      })();
    }
  }, [idLoading, spreadsheetId, googleAccessToken, createSpreadsheet, setSpreadsheetId]);

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
  } = useExpenses(googleAccessToken, spreadsheetId || propSpreadsheetId);

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
      {(idLoading || createLoading) && (
        <View style={{alignItems: 'center', margin: 16}}>
          <ActivityIndicator size="large" color="#00e6d6" />
          <Text style={{marginTop: 8}}>Создаём Google таблицу...</Text>
        </View>
      )}
      {createError && (
        <View style={{alignItems: 'center', margin: 16}}>
          <Text style={{color: 'red'}}>Ошибка создания таблицы: {createError}</Text>
        </View>
      )}
      {spreadsheetId && <SpreadsheetLink spreadsheetId={spreadsheetId} />}
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
