import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import library from './reducers/libraryReducers';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    library,
  });
}
