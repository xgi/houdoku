import {
  DatabaseState,
  BEFORE_LOAD_SERIES_LIST,
  AFTER_LOAD_SERIES_LIST,
  BEFORE_LOAD_SERIES,
  AFTER_LOAD_SERIES,
  AFTER_LOAD_CHAPTER_LIST,
  BEFORE_LOAD_CHAPTER_LIST,
  AFTER_LOAD_CHAPTER,
  BEFORE_LOAD_CHAPTER,
} from './types';

const initialState: DatabaseState = {
  fetchingSeriesList: false,
  fetchingSeries: false,
  fetchingChapter: false,
  fetchingChapterList: false,
  addingSeries: false,
  addingChapters: false,
  seriesList: [],
  series: undefined,
  chapter: undefined,
  chapterList: [],
  addedSeries: undefined,
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
    case BEFORE_LOAD_CHAPTER:
      return { ...state, fetchingChapter: true };
    case AFTER_LOAD_CHAPTER:
      return {
        ...state,
        fetchingChapter: false,
        chapter: action.payload.chapter,
      };
    case BEFORE_LOAD_CHAPTER_LIST:
      return { ...state, fetchingChapterList: true };
    case AFTER_LOAD_CHAPTER_LIST:
      return {
        ...state,
        fetchingChapterList: false,
        chapterList: action.payload.response,
      };
    default:
      return state;
  }
}
