import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExpenseData } from './useGeminiAPI';
import { createMonthSheetTemplate, updateExpenseCellInSheet } from '../utils/sheetsUtils';

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
      const storedExpenses = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        setExpenses(parsedExpenses);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        const date = new Date(newExpense.timestamp);
        const monthYear = `${date.toLocaleString('ru', { month: 'long' })} ${date.getFullYear()}`;
        // Пытаемся обновить ячейку, если листа нет — создаём шаблон и пробуем снова
        try {
          await updateExpenseCellInSheet(
            googleAccessToken,
            spreadsheetId,
            monthYear,
            newExpense.category,
            newExpense.description, // предполагаем, что description = подкатегория
            newExpense.amount
          );
        } catch (err) {
          // Если ошибка — возможно, листа нет, создаём шаблон и пробуем снова
          await createMonthSheetTemplate(googleAccessToken, spreadsheetId, monthYear);
          await updateExpenseCellInSheet(
            googleAccessToken,
            spreadsheetId,
            monthYear,
            newExpense.category,
            newExpense.description,
            newExpense.amount
          );
        }
      } catch (e) {
        console.warn('Ошибка синхронизации с Google Sheets', e);
      }
    }
    return newExpense;
  }, [expenses, saveExpenses, googleAccessToken, spreadsheetId]);

  const removeExpense = useCallback(async (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
  }, [expenses, saveExpenses]);

  const clearExpenses = useCallback(async () => {
    setExpenses([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  // Group expenses by category and date
  const getExpensesByCategory = useCallback(() => {
    const grouped: Record<string, Record<string, Expense[]>> = {};
    
    expenses.forEach(expense => {
      const category = expense.category;
      const date = expense.date || new Date(expense.timestamp).toISOString().split('T')[0];
      
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
      .filter(expense => expense.category === category && expense.date === date)
      .reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // Get all categories
  const getCategories = useCallback(() => {
    const categories = [...new Set(expenses.map(expense => expense.category))];
    return categories.sort();
  }, [expenses]);

  // Get dates for a category
  const getCategoryDates = useCallback((category: string) => {
    const dates = [...new Set(
      expenses
        .filter(expense => expense.category === category)
        .map(expense => expense.date || new Date(expense.timestamp).toISOString().split('T')[0])
    )];
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [expenses]);

  return {
    expenses,
    isLoading,
    addExpense,
    removeExpense,
    clearExpenses,
    getExpensesByCategory,
    getCategoryTotal,
    getCategoryDateTotal,
    getCategories,
    getCategoryDates,
    loadExpenses,
  };
}; 