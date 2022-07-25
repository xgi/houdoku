import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import reader from './features/reader/reducers';
import settings from './features/settings/reducers';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    reader,
    settings,
  });
}
