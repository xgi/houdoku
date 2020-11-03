import { Series } from '../models/types';
import {
  DatabaseAction,
  BEFORE_LOAD_SERIES_LIST,
  BEFORE_LOAD_SERIES,
  AFTER_LOAD_SERIES,
  AFTER_LOAD_SERIES_LIST,
} from './types';

// eslint-disable-next-line import/prefer-default-export
export function beforeLoadSeriesList(): DatabaseAction {
  return {
    type: BEFORE_LOAD_SERIES_LIST,
    payload: {},
  };
}

// eslint-disable-next-line import/prefer-default-export
export function afterLoadSeriesList(response: any): DatabaseAction {
  return {
    type: AFTER_LOAD_SERIES_LIST,
    payload: {
      response,
    },
  };
}

// eslint-disable-next-line import/prefer-default-export
export function beforeLoadSeries(): DatabaseAction {
  return {
    type: BEFORE_LOAD_SERIES,
    payload: {},
  };
}

// eslint-disable-next-line import/prefer-default-export
export function afterLoadSeries(series: Series): DatabaseAction {
  return {
    type: AFTER_LOAD_SERIES,
    payload: {
      series,
    },
  };
}
