import {useState, useCallback, useEffect} from 'react';
import {
  useVoiceRecognition,
  Language,
} from '../../voiceTest/hooks/useVoiceRecognition';
import {useListeningState} from '../../voiceTest/hooks/useListeningState';
import {useGeminiAPI} from './useGeminiAPI';
import {useExpenses} from './useExpenses';

export interface VoiceExpenseState {
  isProcessing: boolean;
  recognizedText: string;
  error: string | null;
  lastExpense: any | null;
}

export const useVoiceExpenseRecognition = (language: Language = 'ru-RU') => {
  const [state, setState] = useState<VoiceExpenseState>({
    isProcessing: false,
    recognizedText: '',
    error: null,
    lastExpense: null,
  });

  const {
    state: voiceState,
    startRecognizing,
    stopRecognizing,
  } = useVoiceRecognition(language);
  const {isListening, hasResults, hasError} = useListeningState(voiceState);
  const {analyzeExpense} = useGeminiAPI();
  const {addExpense} = useExpenses();

  const processRecognizedText = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setState(prev => ({
        ...prev,
        isProcessing: true,
        recognizedText: text,
        error: null,
      }));

      try {
        const expenseData = await analyzeExpense(text);

        console.log('expenseData', expenseData);
        const newExpense = addExpense(expenseData);

        setState(prev => ({
          ...prev,
          isProcessing: false,
          lastExpense: newExpense,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        }));
      }
    },
    [analyzeExpense, addExpense],
  );

  const handleStartRecording = useCallback(async () => {
    setState(prev => ({
      ...prev,
      error: null,
      lastExpense: null,
    }));
    await startRecognizing();
  }, [startRecognizing]);

  const handleStopRecording = useCallback(async () => {
    await stopRecognizing();
  }, [stopRecognizing]);

  // Process results when voice recognition completes
  const handleVoiceResults = useCallback(() => {
    if (hasResults && voiceState.results.length > 0) {
      const recognizedText = voiceState.results[0];
      processRecognizedText(recognizedText);
    }
  }, [hasResults, voiceState.results, processRecognizedText]);

  // Handle voice recognition errors
  const handleVoiceError = useCallback(() => {
    if (hasError) {
      setState(prev => ({
        ...prev,
        error: voiceState.error || 'Voice recognition failed',
      }));
    }
  }, [hasError, voiceState.error]);

  // Watch for voice recognition state changes
  useEffect(() => {
    if (hasResults && !isListening) {
      handleVoiceResults();
    }
  }, [hasResults, isListening, handleVoiceResults]);

  useEffect(() => {
    if (hasError) {
      handleVoiceError();
    }
  }, [hasError, handleVoiceError]);

  return {
    // Voice recognition state
    isListening,
    hasResults,
    hasError,
    voiceState,

    // Processing state
    isProcessing: state.isProcessing,
    recognizedText: state.recognizedText,
    error: state.error,
    lastExpense: state.lastExpense,

    // Actions
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
    processRecognizedText,
  };
};
