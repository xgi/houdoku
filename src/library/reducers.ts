import {
  LibraryState,
  UPDATE_SERIES_LIST,
  SAVE_LIBRARY,
  READ_LIBRARY,
  DELETE_LIBRARY,
  CHANGE_NUM_COLUMNS,
  SET_CHAPTER_READ,
  SET_RELOADING_SERIES,
} from './types';

const initialState: LibraryState = {
  seriesList: [],
  columns: 6,
  reloadingSeries: false,
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
    case SET_RELOADING_SERIES:
      return { ...state, reloadingSeries: action.payload.reloading };
    default:
      return state;
  }
}
