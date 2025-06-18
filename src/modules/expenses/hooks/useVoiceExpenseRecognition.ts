import { useState, useCallback, useRef } from 'react';
import { useGeminiAPI } from './useGeminiAPI';
import { ExpenseData } from './useGeminiAPI';

export const useVoiceExpenseRecognition = (addExpense: (expense: ExpenseData) => Promise<any>) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const lastProcessedText = useRef<string>('');
  const { analyzeExpense } = useGeminiAPI();

  const processVoiceInput = useCallback(async (text: string) => {
    // Prevent processing the same text multiple times
    if (text === lastProcessedText.current || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    lastProcessedText.current = text;

    try {
      const expense = await analyzeExpense(text);
      await addExpense(expense);
    } catch (error) {
      console.error('Error processing voice input:', error);
      // Не показываем ошибку SPREADSHEET_NOT_FOUND пользователю, так как она обрабатывается автоматически
      if (error instanceof Error && error.message === 'SPREADSHEET_NOT_FOUND') {
        // Ошибка обрабатывается автоматически, не показываем её пользователю
        return;
      }
      setProcessingError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  }, [analyzeExpense, addExpense, isProcessing]);

  return {
    processVoiceInput,
    isProcessing,
    processingError,
  };
};
