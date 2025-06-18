import { useEffect, useState, useCallback } from 'react';
import Voice, {
  type SpeechRecognizedEvent,
  type SpeechResultsEvent,
  type SpeechErrorEvent,
} from '@react-native-voice/voice';

export interface VoiceState {
  recognized: string;
  volume: string;
  error: string;
  end: string;
  started: string;
  results: string[];
  partialResults: string[];
}

export type Language = 'en-US' | 'ru-RU';

export const useVoiceRecognition = (language: Language = 'en-US') => {
  const [state, setState] = useState<VoiceState>({
    recognized: '',
    volume: '',
    error: '',
    end: '',
    started: '',
    results: [],
    partialResults: [],
  });

  const clearState = useCallback(() => {
    setState({
      recognized: '',
      volume: '',
      error: '',
      end: '',
      started: '',
      results: [],
      partialResults: [],
    });
  }, []);

  const onSpeechStart = useCallback((e: any) => {
    console.log('onSpeechStart: ', e);
    setState(prev => ({ ...prev, started: '√' }));
  }, []);

  const onSpeechRecognized = useCallback((e: SpeechRecognizedEvent) => {
    console.log('onSpeechRecognized: ', e);
    setState(prev => ({ ...prev, recognized: '√' }));
  }, []);

  const onSpeechEnd = useCallback((e: any) => {
    console.log('onSpeechEnd: ', e);
    setState(prev => ({ ...prev, end: '√' }));
  }, []);

  const onSpeechError = useCallback((e: SpeechErrorEvent) => {
    console.log('onSpeechError: ', e);
    setState(prev => ({ ...prev, error: JSON.stringify(e.error) }));
  }, []);

  const onSpeechResults = useCallback((e: SpeechResultsEvent) => {
    console.log('onSpeechResults: ', e);
    setState(prev => ({
      ...prev,
      results: e.value && e.value?.length > 0 ? e.value : [],
    }));
  }, []);

  const onSpeechPartialResults = useCallback((e: SpeechResultsEvent) => {
    console.log('onSpeechPartialResults: ', e);
    setState(prev => ({
      ...prev,
      partialResults: e.value && e.value?.length > 0 ? e.value : [],
    }));
  }, []);

  const onSpeechVolumeChanged = useCallback((e: any) => {
    console.log('onSpeechVolumeChanged: ', e);
    setState(prev => ({ ...prev, volume: e.value }));
  }, []);

  const startRecognizing = useCallback(async () => {
    clearState();
    try {
      await Voice.start(language);
      console.log(`called start with language: ${language}`);
    } catch (e) {
      console.error(e);
    }
  }, [clearState, language]);

  const stopRecognizing = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const cancelRecognizing = useCallback(async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const destroyRecognizer = useCallback(async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
    clearState();
  }, [clearState]);

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [
    onSpeechStart,
    onSpeechRecognized,
    onSpeechEnd,
    onSpeechError,
    onSpeechResults,
    onSpeechPartialResults,
    onSpeechVolumeChanged,
  ]);

  return {
    state,
    startRecognizing,
    stopRecognizing,
    cancelRecognizing,
    destroyRecognizer,
    clearState,
  };
}; 