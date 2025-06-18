import { useState, useCallback } from 'react';

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
      const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: { title: 'Orbitric Expenses' },
          sheets: [
            {
              properties: { title: 'Расходы' },
            },
          ],
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error('Ошибка создания таблицы: ' + errText);
      }
      const data = await res.json();
      return { spreadsheetId: data.spreadsheetId, url: data.spreadsheetUrl };
    } catch (e: any) {
      setError(e.message || 'Ошибка');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { createSpreadsheet, loading, error };
} 