import {
  DatabaseState,
  BEFORE_LOAD_SERIES_LIST,
  AFTER_LOAD_SERIES_LIST,
  BEFORE_LOAD_SERIES,
  AFTER_LOAD_SERIES,
} from './types';

const initialState: DatabaseState = {
  fetchingSeriesList: false,
  fetchingSeries: false,
  seriesList: [],
  series: undefined,
};

export default function datastore(
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): DatabaseState {
  switch (action.type) {
    case BEFORE_LOAD_SERIES_LIST:
      return { ...state, fetchingSeriesList: true };
    case AFTER_LOAD_SERIES_LIST:
      return {
        ...state,
        fetchingSeriesList: false,
        seriesList: action.payload.response,
      };
    case BEFORE_LOAD_SERIES:
      return { ...state, fetchingSeries: true };
    case AFTER_LOAD_SERIES:
      return {
        ...state,
        fetchingSeries: false,
        series: action.payload.series,
      };
    default:
      return state;
  }
}
