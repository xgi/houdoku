import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import status from './features/statusbar/reducers';
import reader from './features/reader/reducers';
import search from './features/search/reducers';
import settings from './features/settings/reducers';
import downloader from './features/downloader/reducers';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    status,
    reader,
    search,
    settings,
    downloader,
  });
}
