import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import settings from './features/settings/reducers';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    settings,
  });
}
