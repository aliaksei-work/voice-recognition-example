import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../../voiceTest/hooks/useVoiceRecognition';

const LANGUAGE_STORAGE_KEY = 'app_language';

export const useAppLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ru-RU');
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем сохраненный язык при инициализации
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'ru-RU' || savedLanguage === 'en-US')) {
        setCurrentLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Ошибка загрузки сохраненного языка:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (language: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      setCurrentLanguage(language);
      console.log(`Язык приложения изменен на: ${language}`);
    } catch (error) {
      console.error('Ошибка сохранения языка:', error);
      throw error;
    }
  };

  return {
    currentLanguage,
    changeLanguage,
    isLoading,
  };
}; 