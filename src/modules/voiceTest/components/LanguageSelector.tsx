import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Language} from '../hooks/useVoiceRecognition';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  isListening?: boolean;
}

const languages: {value: Language; label: string; flag: string}[] = [
  {value: 'en-US', label: 'English', flag: '🇺🇸'},
  {value: 'ru-RU', label: 'Русский', flag: '🇷🇺'},
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  isListening = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      <View style={styles.languageGrid}>
        {languages.map(language => (
          <TouchableOpacity
            key={language.value}
            style={[
              styles.languageButton,
              selectedLanguage === language.value && styles.selectedLanguage,
              isListening && styles.disabled,
            ]}
            onPress={() => onLanguageChange(language.value)}
            disabled={isListening}
            activeOpacity={0.7}>
            <Text style={styles.flag}>{language.flag}</Text>
            <Text
              style={[
                styles.languageText,
                selectedLanguage === language.value &&
                  styles.selectedLanguageText,
              ]}>
              {language.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#2c3e50',
  },
  languageGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    minWidth: 100,
    justifyContent: 'center',
  },
  selectedLanguage: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  disabled: {
    opacity: 0.6,
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  selectedLanguageText: {
    color: '#ffffff',
  },
});
