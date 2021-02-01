import {
  LibraryState,
  UPDATE_SERIES_LIST,
  CHANGE_NUM_COLUMNS,
  SET_FILTER,
} from './types';

const initialState: LibraryState = {
  seriesList: [],
  columns: 6,
  filter: '',
};

export default function library(
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): LibraryState {
  switch (action.type) {
    case UPDATE_SERIES_LIST:
      return { ...state, columns: 2 };
    case CHANGE_NUM_COLUMNS:
      return { ...state, columns: action.payload.columns };
    case SET_FILTER:
      return { ...state, filter: action.payload.filter };
    default:
      return state;
  }
}
