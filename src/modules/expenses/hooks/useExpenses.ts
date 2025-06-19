import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExpenseData } from './useGeminiAPI';
import { appendExpenseToSheet, loadExpensesFromSheet, clearSheetData } from '../utils/sheetsUtils';

export interface Expense extends ExpenseData {
  id: string;
  timestamp: number;
}

const STORAGE_KEY = 'expenses_history';

export const useExpenses = (googleAccessToken?: string, spreadsheetId?: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    try {
      // Сначала загружаем из локального хранилища
      const storedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
      let localExpenses: Expense[] = [];
      if (storedExpenses) {
        localExpenses = JSON.parse(storedExpenses);
      }

      // Если есть доступ к Google Sheets, синхронизируем с таблицей
      if (googleAccessToken && spreadsheetId) {
        try {
          const sheetExpenses = await loadExpensesFromSheet(googleAccessToken, spreadsheetId);
          
          // Объединяем локальные и табличные данные, убирая дубликаты
          const allExpenses = [...localExpenses];
          sheetExpenses.forEach((sheetExpense: Expense) => {
            const exists = allExpenses.find(local => 
              local.timestamp === sheetExpense.timestamp && 
              local.amount === sheetExpense.amount &&
              local.description === sheetExpense.description
            );
            if (!exists) {
              allExpenses.push(sheetExpense);
            }
          });

          // Сортируем по времени (новые сверху)
          allExpenses.sort((a, b) => b.timestamp - a.timestamp);
          
          setExpenses(allExpenses);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allExpenses));
        } catch (error) {
          console.warn('Ошибка синхронизации с Google Sheets:', error);
          // Если синхронизация не удалась, используем локальные данные
          setExpenses(localExpenses);
        }
      } else {
        setExpenses(localExpenses);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [googleAccessToken, spreadsheetId]);

  // Load expenses from storage on mount
  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const saveExpenses = useCallback(async (newExpenses: Expense[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  }, []);

  const checkSpreadsheetExists = useCallback(async (token: string, id: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }, []);

  const addExpense = useCallback(async (expense: ExpenseData) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);

    // Синхронизация с Google Sheets
    if (googleAccessToken && spreadsheetId) {
      try {
        // Проверяем существование таблицы
        const exists = await checkSpreadsheetExists(googleAccessToken, spreadsheetId);
        if (!exists) {
          throw new Error('SPREADSHEET_NOT_FOUND');
        }

        // Добавляем трату в таблицу
        await appendExpenseToSheet(googleAccessToken, spreadsheetId, newExpense);
      } catch (e) {
        if (e instanceof Error && e.message === 'SPREADSHEET_NOT_FOUND') {
          throw e; // Пробрасываем ошибку дальше для обработки в ExpenseTracker
        }
        console.warn('Ошибка синхронизации с Google Sheets', e);
      }
    }
    return newExpense;
  }, [expenses, saveExpenses, googleAccessToken, spreadsheetId, checkSpreadsheetExists]);

  const removeExpense = useCallback(async (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  }, [expenses, saveExpenses]);

  const clearExpenses = useCallback(async () => {
    setExpenses([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  // Upload all local expenses to Google Sheets
  const uploadAllToSheets = useCallback(async () => {
    if (!googleAccessToken || !spreadsheetId) {
      throw new Error('Нет доступа к Google Sheets');
    }

    try {
      // Очищаем все листы в таблице
      await clearSheetData(googleAccessToken, spreadsheetId);
      
      // Загружаем все локальные траты в таблицу
      for (const expense of expenses) {
        await appendExpenseToSheet(googleAccessToken, spreadsheetId, expense);
      }
      
      console.log(`Успешно загружено ${expenses.length} трат в Google Sheets`);
    } catch (error) {
      console.error('Ошибка при загрузке трат в Google Sheets:', error);
      throw error;
    }
  }, [expenses, googleAccessToken, spreadsheetId]);

  // Download all expenses from Google Sheets and replace local data
  const downloadAllFromSheets = useCallback(async () => {
    if (!googleAccessToken || !spreadsheetId) {
      throw new Error('Нет доступа к Google Sheets');
    }

    try {
      // Загружаем все траты из таблицы
      const sheetExpenses = await loadExpensesFromSheet(googleAccessToken, spreadsheetId);
      
      // Сортируем по времени (новые сверху)
      sheetExpenses.sort((a, b) => b.timestamp - a.timestamp);
      
      // Заменяем локальные данные
      setExpenses(sheetExpenses);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sheetExpenses));
      
      console.log(`Успешно загружено ${sheetExpenses.length} трат из Google Sheets`);
    } catch (error) {
      console.error('Ошибка при загрузке трат из Google Sheets:', error);
      throw error;
    }
  }, [googleAccessToken, spreadsheetId]);

  // Group expenses by category and date
  const getExpensesByCategory = useCallback(() => {
    const grouped: Record<string, Record<string, Expense[]>> = {};
    
    expenses.forEach(expense => {
      const category = expense.category;
      const date = new Date(expense.timestamp).toISOString().split('T')[0];
      
      if (!grouped[category]) {
        grouped[category] = {};
      }
      
      if (!grouped[category][date]) {
        grouped[category][date] = [];
      }
      
      grouped[category][date].push(expense);
    });

    // Sort dates within each category
    Object.keys(grouped).forEach(category => {
      const dates = Object.keys(grouped[category]).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const sortedCategory: Record<string, Expense[]> = {};
      dates.forEach(date => {
        sortedCategory[date] = grouped[category][date].sort((a, b) => b.timestamp - a.timestamp);
      });
      grouped[category] = sortedCategory;
    });

    return grouped;
  }, [expenses]);

  // Get total amount for a category
  const getCategoryTotal = useCallback((category: string) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // Get total amount for a category on a specific date
  const getCategoryDateTotal = useCallback((category: string, date: string) => {
    return expenses
      .filter(expense => expense.category === category && 
        new Date(expense.timestamp).toISOString().split('T')[0] === date)
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // Get all categories
  const getCategories = useCallback(() => {
    const categories = Array.from(new Set(expenses.map(expense => expense.category)));
    return categories.sort();
  }, [expenses]);

  // Get dates for a category
  const getCategoryDates = useCallback((category: string) => {
    const dates = Array.from(new Set(
      expenses
        .filter(expense => expense.category === category)
        .map(expense => new Date(expense.timestamp).toISOString().split('T')[0])
    ));
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [expenses]);

  return {
    expenses,
    isLoading,
    addExpense,
    removeExpense,
    clearExpenses,
    uploadAllToSheets,
    downloadAllFromSheets,
    getExpensesByCategory,
    getCategoryTotal,
    getCategoryDateTotal,
    getCategories,
    getCategoryDates,
    loadExpenses,
  };
}; 