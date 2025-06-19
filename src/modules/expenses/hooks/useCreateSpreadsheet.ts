import { useState, useCallback } from 'react';
import { createSimpleExpenseSheet } from '../utils/sheetsUtils';

interface CreateSpreadsheetResult {
  spreadsheetId: string;
  url: string;
}

export function useCreateSpreadsheet(token?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSpreadsheet = useCallback(async (): Promise<CreateSpreadsheetResult | null> => {
    if (!token) return null;
    setLoading(true);
    setError(null);
    try {
      // Создаем таблицу
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: 'Orbitric Expenses',
            locale: 'ru_RU',
            timeZone: 'Europe/Moscow',
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error('Ошибка создания таблицы: ' + errText);
      }

      const data = await res.json();
      const spreadsheetId = data.spreadsheetId;

      // Создаем лист для текущего месяца
      const date = new Date();
      const monthYear = `${date.toLocaleString('ru', { month: 'long' })} ${date.getFullYear()}`;
      await createSimpleExpenseSheet(token, spreadsheetId, monthYear);

      return { spreadsheetId, url: data.spreadsheetUrl };
    } catch (e: any) {
      setError(e.message || 'Ошибка');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { createSpreadsheet, loading, error };
} 