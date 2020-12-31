import {
  AFTER_GET_CHAPTERS,
  AFTER_GET_SERIES,
  BEFORE_GET_CHAPTERS,
  BEFORE_GET_SERIES,
  BEFORE_IMPORT_SERIES,
  AFTER_IMPORT_SERIES,
  ExtensionState,
} from './types';

const initialState: ExtensionState = {
  fetchingSeries: false,
  fetchingSeriesId: '',
  fetchingChapters: false,
  importingSeries: false,
  series: undefined,
  chapters: [],
};

export default function extension(
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): ExtensionState {
  switch (action.type) {
    case BEFORE_GET_SERIES:
      return {
        ...state,
        fetchingSeries: true,
        fetchingSeriesId: action.payload.id,
      };
    case AFTER_GET_SERIES:
      return {
        ...state,
        fetchingSeries: false,
        fetchingSeriesId: '',
        series: action.payload.series,
      };
    case BEFORE_GET_CHAPTERS:
      return { ...state, fetchingSeries: true };
    case AFTER_GET_CHAPTERS:
      return {
        ...state,
        fetchingChapters: false,
        chapters: action.payload.chapters,
      };
    case BEFORE_IMPORT_SERIES:
      return { ...state, importingSeries: true };
    case AFTER_IMPORT_SERIES:
      return { ...state, importingSeries: false };
    default:
      return state;
  }
}
