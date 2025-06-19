import React, {useState} from 'react';
import {StyleSheet, ScrollView, SafeAreaView} from 'react-native';
import {useVoiceRecognition, Language} from './hooks/useVoiceRecognition';
import {useListeningState} from './hooks/useListeningState';
import {VoiceHeader} from './components/VoiceHeader';
import {VoiceStatus} from './components/VoiceStatus';
import {VoiceControls} from './components/VoiceControls';

const VoiceTest: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en-US');

  const {state, startRecognizing, stopRecognizing} =
    useVoiceRecognition(selectedLanguage);

  const {isListening, hasResults, hasError} = useListeningState(state);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <VoiceHeader />

        <VoiceControls
          onStart={startRecognizing}
          onStop={stopRecognizing}
          isListening={isListening}
        />

        {(hasResults || hasError || isListening) && (
          <VoiceStatus state={state} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 20,
  },
});

export default VoiceTest;
