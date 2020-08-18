import { LibraryState } from '../types/states/libraryStateTypes';
import {
  UPDATE_SERIES_LIST,
  CHANGE_NUM_COLUMNS,
} from '../types/actions/libraryActionTypes';

const initialState: LibraryState = {
  seriesListUpdated: 'no',
  columns: 4,
};

export default function library(
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): LibraryState {
  switch (action.type) {
    case UPDATE_SERIES_LIST:
      return { ...state, seriesListUpdated: 'yes' };
    case CHANGE_NUM_COLUMNS:
      return { ...state, columns: action.payload.columns };
    default:
      return state;
  }
}
