import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import library from './library/reducers';
import status from './statusbar/reducers';
import datastore from './datastore/reducers';
import reader from './reader/reducers';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    library,
    status,
    datastore,
    reader,
  });
}
