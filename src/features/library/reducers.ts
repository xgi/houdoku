import { Series } from 'houdoku-extension-lib';
import {
  LibraryState,
  SET_FILTER,
  SET_SERIES_BANNER_URL,
  SET_SERIES_LIST,
  SET_SERIES,
  SET_CHAPTER_LIST,
  SET_COMPLETED_START_RELOAD,
  SET_RELOADING_SERIES_LIST,
  SET_CHAPTER_FILTER_TITLE,
  SET_CHAPTER_FILTER_GROUP,
} from './types';

const initialState: LibraryState = {
  seriesList: [],
  series: undefined,
  chapterList: [],
  reloadingSeriesList: false,
  filter: '',
  seriesBannerUrl: null,
  completedStartReload: false,
  chapterFilterTitle: '',
  chapterFilterGroup: '',
};

export default function library(
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): LibraryState {
  switch (action.type) {
    case SET_SERIES_LIST:
      return {
        ...state,
        seriesList: action.payload.seriesList,
      };
    case SET_SERIES:
      return { ...state, series: action.payload.series };
    case SET_CHAPTER_LIST:
      return { ...state, chapterList: action.payload.chapterList };
    case SET_RELOADING_SERIES_LIST:
      return {
        ...state,
        reloadingSeriesList: action.payload.reloadingSeriesList,
      };
    case SET_FILTER:
      return { ...state, filter: action.payload.filter };
    case SET_SERIES_BANNER_URL:
      return { ...state, seriesBannerUrl: action.payload.seriesBannerUrl };
    case SET_COMPLETED_START_RELOAD:
      return {
        ...state,
        completedStartReload: action.payload.completedStartReload,
      };
    case SET_CHAPTER_FILTER_TITLE:
      return {
        ...state,
        chapterFilterTitle: action.payload.chapterFilterTitle,
      };
    case SET_CHAPTER_FILTER_GROUP:
      return {
        ...state,
        chapterFilterGroup: action.payload.chapterFilterGroup,
      };
    default:
      return state;
  }
}
