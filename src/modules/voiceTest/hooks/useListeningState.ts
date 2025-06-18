import { useMemo } from 'react';
import { VoiceState } from './useVoiceRecognition';

export const useListeningState = (state: VoiceState) => {
  const isListening = useMemo(() => {
    return state.started === '√' && state.end !== '√' && !state.error;
  }, [state.started, state.end, state.error]);

  const hasResults = useMemo(() => {
    return state.results.length > 0 || state.partialResults.length > 0;
  }, [state.results, state.partialResults]);

  const hasError = useMemo(() => {
    return !!state.error;
  }, [state.error]);

  return {
    isListening,
    hasResults,
    hasError,
  };
}; 