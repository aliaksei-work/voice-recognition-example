import { useState, useCallback } from 'react';
import { ExpenseData } from './useGeminiAPI';

export interface Expense extends ExpenseData {
  id: string;
  timestamp: number;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const addExpense = useCallback((expense: ExpenseData) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  }, []);

  const removeExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  }, []);

  const clearExpenses = useCallback(() => {
    setExpenses([]);
  }, []);

  return {
    expenses,
    addExpense,
    removeExpense,
    clearExpenses,
  };
}; 