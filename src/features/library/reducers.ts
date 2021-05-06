import { ProgressFilter, Series } from '../../models/types';
import {
  LibraryState,
  CHANGE_NUM_COLUMNS,
  SET_FILTER,
  SET_SERIES_BANNER_URL,
  SET_SERIES_LIST,
  SET_SERIES,
  SET_CHAPTER_LIST,
  SET_FILTER_STATUS,
  SET_FILTER_PROGRESS,
  SET_FILTER_USER_TAGS,
  SET_COMPLETED_START_RELOAD,
} from './types';

const initialState: LibraryState = {
  seriesList: [],
  series: undefined,
  chapterList: [],
  userTags: [],
  columns: 6,
  filter: '',
  filterStatus: null,
  filterProgress: ProgressFilter.All,
  filterUserTags: [],
  seriesBannerUrl: null,
  completedStartReload: false,
};

const parseUserTags = (seriesList: Series[]): string[] => {
  const userTags = new Set<string>();
  seriesList.forEach((series: Series) => {
    series.userTags.forEach((userTag: string) => {
      userTags.add(userTag);
    });
  });
  return Array.from(userTags);
};

export default function library(
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): LibraryState {
  switch (action.type) {
    case SET_SERIES_LIST:
      return {
        ...state,
        seriesList: action.payload.seriesList,
        userTags: parseUserTags(action.payload.seriesList),
      };
    case SET_SERIES:
      return { ...state, series: action.payload.series };
    case SET_CHAPTER_LIST:
      return { ...state, chapterList: action.payload.chapterList };
    case CHANGE_NUM_COLUMNS:
      return { ...state, columns: action.payload.columns };
    case SET_FILTER:
      return { ...state, filter: action.payload.filter };
    case SET_FILTER_STATUS:
      return { ...state, filterStatus: action.payload.status };
    case SET_FILTER_PROGRESS:
      return { ...state, filterProgress: action.payload.progress };
    case SET_FILTER_USER_TAGS:
      return { ...state, filterUserTags: action.payload.userTags };
    case SET_SERIES_BANNER_URL:
      return { ...state, seriesBannerUrl: action.payload.seriesBannerUrl };
    case SET_COMPLETED_START_RELOAD:
      return {
        ...state,
        completedStartReload: action.payload.completedStartReload,
      };
    default:
      return state;
  }
}
