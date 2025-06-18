import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import VoiceTest from './src/modules/voiceTest/VoiceTestFuncComp';

AppRegistry.registerComponent(appName, () => VoiceTest);
