import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import library from './features/library/reducers';
import status from './features/statusbar/reducers';
import reader from './features/reader/reducers';
import search from './features/search/reducers';
import settings from './features/settings/reducers';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    library,
    status,
    reader,
    search,
    settings,
  });
}
