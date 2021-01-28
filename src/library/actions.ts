import { Chapter } from '../models/types';
import {
  UPDATE_SERIES_LIST,
  CHANGE_NUM_COLUMNS,
  LibraryAction,
  READ_LIBRARY,
  SAVE_LIBRARY,
  DELETE_LIBRARY,
  SET_CHAPTER_READ,
  GET_SERIES,
  SET_RELOADING_SERIES,
} from './types';

export function updateSeriesList(): LibraryAction {
  return {
    type: UPDATE_SERIES_LIST,
  };
}

export function saveLibrary(): LibraryAction {
  return {
    type: SAVE_LIBRARY,
  };
}

export function readLibrary(): LibraryAction {
  return {
    type: READ_LIBRARY,
  };
}

export function deleteLibrary(): LibraryAction {
  return {
    type: DELETE_LIBRARY,
  };
}

export function changeNumColumns(columns: number): LibraryAction {
  return {
    type: CHANGE_NUM_COLUMNS,
    payload: {
      columns,
    },
  };
}

export function getSeries(uuid: string): LibraryAction {
  return {
    type: GET_SERIES,
    payload: {
      uuid,
    },
  };
}

export function setChapterRead(chapter: Chapter, read: boolean): LibraryAction {
  return {
    type: SET_CHAPTER_READ,
    payload: {
      chapter,
      read,
    },
  };
}

export function setReloadingSeries(reloading: boolean): LibraryAction {
  return {
    type: SET_RELOADING_SERIES,
    payload: {
      reloading,
    },
  };
}
