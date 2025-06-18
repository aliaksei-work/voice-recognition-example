import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'spreadsheetId';

export function useSpreadsheetId() {
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(id => {
      setSpreadsheetId(id);
      setLoading(false);
    });
  }, []);

  const saveSpreadsheetId = useCallback(async (id: string) => {
    await AsyncStorage.setItem(STORAGE_KEY, id);
    setSpreadsheetId(id);
  }, []);

  return { spreadsheetId, setSpreadsheetId: saveSpreadsheetId, loading };
} 