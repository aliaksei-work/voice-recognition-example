import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../../voiceTest/hooks/useVoiceRecognition';

const LANGUAGE_STORAGE_KEY = 'app_language';

interface SettingsScreenProps {
  onLanguageChange: (language: Language) => void;
  currentLanguage: Language;
  onBack: () => void;
}

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский' },
  { code: 'en-US', name: 'English', nativeName: 'English' },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onLanguageChange,
  currentLanguage,
  onBack,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);

  const handleLanguageSelect = async (language: Language) => {
    try {
      // Сохраняем выбранный язык в AsyncStorage
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      
      // Обновляем состояние
      setSelectedLanguage(language);
      
      // Уведомляем родительский компонент
      onLanguageChange(language);
      
      Alert.alert(
        'Язык изменен',
        `Язык приложения изменен на ${languages.find(l => l.code === language)?.nativeName}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Ошибка сохранения языка:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить выбранный язык');
    }
  };

  const getLanguageDisplayName = (languageCode: Language) => {
    const language = languages.find(l => l.code === languageCode);
    return language ? `${language.nativeName} (${language.name})` : languageCode;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Настройки</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Язык приложения</Text>
          <Text style={styles.sectionDescription}>
            Выберите язык для интерфейса приложения и голосового ввода
          </Text>

          <View style={styles.languageList}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  selectedLanguage === language.code && styles.languageItemSelected,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <View style={styles.languageInfo}>
                  <Text style={styles.languageNativeName}>
                    {language.nativeName}
                  </Text>
                  <Text style={styles.languageEnglishName}>
                    {language.name}
                  </Text>
                </View>
                {selectedLanguage === language.code && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Версия</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Разработчик</Text>
            <Text style={styles.infoValue}>Orbitric Team</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
    lineHeight: 20,
  },
  languageList: {
    gap: 12,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  languageInfo: {
    flex: 1,
  },
  languageNativeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  languageEnglishName: {
    fontSize: 14,
    color: '#6c757d',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6c757d',
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
}); 