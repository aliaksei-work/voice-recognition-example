import React, {useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import {
  useVoiceRecognition,
  Language,
} from '../voiceTest/hooks/useVoiceRecognition';
import {useListeningState} from '../voiceTest/hooks/useListeningState';
import {VoiceHeader} from '../voiceTest/components/VoiceHeader';
import {VoiceStatus} from '../voiceTest/components/VoiceStatus';
import {VoiceControls} from '../voiceTest/components/VoiceControls';
import {useExpenses} from './hooks/useExpenses';
import {useVoiceExpenseRecognition} from './hooks/useVoiceExpenseRecognition';
import {ExpensesList} from './components/ExpensesList';
import {ProcessingStatus} from './components/ProcessingStatus';
import {ExpenseStats} from './components/ExpenseStats';
import {ExpenseHistory} from './components/ExpenseHistory';
import {ModeSelector, AppMode} from './components/ModeSelector';
import {SpreadsheetLink} from './components/SpreadsheetLink';
import {SyncButtons} from './components/SyncButtons';
import {SettingsScreen} from './components/SettingsScreen';
import {useAppLanguage} from './hooks/useAppLanguage';
import {useSpreadsheetId} from './hooks/useSpreadsheetId';
import {useCreateSpreadsheet} from './hooks/useCreateSpreadsheet';
import {ExpenseData} from './hooks/useGeminiAPI';
import {ExpenseCategories} from './components/ExpenseCategories';
import {BottomBar} from './components/BottomBar';

interface ExpenseTrackerProps {
  googleAccessToken?: string;
  spreadsheetId?: string;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  googleAccessToken,
  spreadsheetId: propSpreadsheetId,
}) => {
  const [currentMode, setCurrentMode] = useState<AppMode>('add');
  const [recreatingSpreadsheet, setRecreatingSpreadsheet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    currentLanguage,
    changeLanguage,
    isLoading: languageLoading,
  } = useAppLanguage();

  const {
    spreadsheetId,
    setSpreadsheetId,
    loading: idLoading,
  } = useSpreadsheetId();
  const {
    createSpreadsheet,
    loading: createLoading,
    error: createError,
  } = useCreateSpreadsheet(googleAccessToken);

  React.useEffect(() => {
    if (!idLoading && !spreadsheetId && googleAccessToken) {
      (async () => {
        const created = await createSpreadsheet();
        if (created?.spreadsheetId) {
          setSpreadsheetId(created.spreadsheetId);
        }
      })();
    }
  }, [
    idLoading,
    spreadsheetId,
    googleAccessToken,
    createSpreadsheet,
    setSpreadsheetId,
  ]);

  const {state, startRecognizing, stopRecognizing} =
    useVoiceRecognition(currentLanguage);

  const {isListening, hasResults, hasError} = useListeningState(state);

  const {
    expenses,
    addExpense,
    removeExpense,
    clearExpenses,
    uploadAllToSheets,
    downloadAllFromSheets,
    getExpensesByCategory,
    getCategoryTotal,
    getCategoryDateTotal,
    getCategories,
  } = useExpenses(googleAccessToken, spreadsheetId || propSpreadsheetId);

  const handleSpreadsheetNotFound = React.useCallback(async () => {
    if (googleAccessToken && !recreatingSpreadsheet) {
      setRecreatingSpreadsheet(true);
      try {
        const created = await createSpreadsheet();
        if (created?.spreadsheetId) {
          setSpreadsheetId(created.spreadsheetId);
        }
      } finally {
        setRecreatingSpreadsheet(false);
      }
    }
  }, [
    googleAccessToken,
    createSpreadsheet,
    setSpreadsheetId,
    recreatingSpreadsheet,
  ]);

  const addExpenseWithSpreadsheetCheck = React.useCallback(
    async (expense: ExpenseData) => {
      try {
        await addExpense(expense);
      } catch (e) {
        if (e instanceof Error && e.message === 'SPREADSHEET_NOT_FOUND') {
          await handleSpreadsheetNotFound();
          // После пересоздания таблицы пробуем добавить расход снова
          await addExpense(expense);
        } else {
          throw e;
        }
      }
    },
    [addExpense, handleSpreadsheetNotFound],
  );

  const {processVoiceInput, isProcessing, processingError} =
    useVoiceExpenseRecognition(addExpenseWithSpreadsheetCheck);

  const handleLanguageChange = async (language: Language) => {
    try {
      await changeLanguage(language);
    } catch (error) {
      console.error('Ошибка изменения языка:', error);
    }
  };

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handleVoiceResult = async (text: string) => {
    await processVoiceInput(text);
  };

  const handleSettingsPress = () => {
    setShowSettings(true);
  };

  const handleSettingsBack = () => {
    setShowSettings(false);
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

  const renderAddMode = () => (
    <>
      <View style={styles.categoriesContainer}>
        <ExpenseCategories
          expenses={expenses}
          onCategoryPress={handleCategoryPress}
        />
      </View>

      {(hasResults || hasError || isListening) && (
        <VoiceStatus state={state} onResult={handleVoiceResult} />
      )}

      {(isProcessing || recreatingSpreadsheet) && <ProcessingStatus />}

      {processingError && (
        <View style={styles.errorContainer}>
          <ProcessingStatus error={processingError} />
        </View>
      )}

      {spreadsheetId && (
        <SyncButtons
          onUploadToSheets={uploadAllToSheets}
          onDownloadFromSheets={downloadAllFromSheets}
        />
      )}

      {selectedCategory && (
        <View style={styles.selectedCategoryContainer}>
          <ExpensesList
            expenses={expenses.filter(e => e.category === selectedCategory)}
            onRemoveExpense={removeExpense}
            onClearAll={() => setSelectedCategory(null)}
          />
        </View>
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

  // Показываем экран настроек
  if (showSettings) {
    return (
      <SettingsScreen
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onBack={handleSettingsBack}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <VoiceHeader onSettingsPress={handleSettingsPress} />
      
      {(idLoading || createLoading || languageLoading) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00e6d6" />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      )}
      
      {createError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Ошибка создания таблицы: {createError}
          </Text>
        </View>
      )}
      
      {spreadsheetId && <SpreadsheetLink spreadsheetId={spreadsheetId} />}

      <View style={styles.mainContainer}>
        {currentMode === 'add' ? renderAddMode() : renderHistoryMode()}
      </View>

      <BottomBar
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onStart={startRecognizing}
        onStop={stopRecognizing}
        isListening={isListening}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004953',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  categoriesContainer: {
    flex: 1,
    position: 'relative',
  },
  selectedCategoryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 73, 83, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '50%',
  },
  loadingContainer: {
    alignItems: 'center',
    margin: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#fff',
  },
  errorContainer: {
    alignItems: 'center',
    margin: 16,
  },
  errorText: {
    color: 'red',
  },
});

export default ExpenseTracker;
