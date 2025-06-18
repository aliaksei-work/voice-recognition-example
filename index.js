import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import {ExpenseTracker} from './src/modules';

AppRegistry.registerComponent(appName, () => ExpenseTracker);
