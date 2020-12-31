import { Chapter, Series } from '../models/types';
import {
  ExtensionAction,
  BEFORE_GET_SERIES,
  AFTER_GET_SERIES,
  BEFORE_GET_CHAPTERS,
  AFTER_GET_CHAPTERS,
  BEFORE_IMPORT_SERIES,
  AFTER_IMPORT_SERIES,
} from './types';

// eslint-disable-next-line import/prefer-default-export
export function beforeGetSeries(id: string): ExtensionAction {
  return {
    type: BEFORE_GET_SERIES,
    payload: {
      id,
    },
  };
}

// eslint-disable-next-line import/prefer-default-export
export function afterGetSeries(series: Series): ExtensionAction {
  return {
    type: AFTER_GET_SERIES,
    payload: {
      series,
    },
  };
}

// eslint-disable-next-line import/prefer-default-export
export function beforeGetChapters(): ExtensionAction {
  return {
    type: BEFORE_GET_CHAPTERS,
    payload: {},
  };
}

// eslint-disable-next-line import/prefer-default-export
export function afterGetChapters(chapters: Chapter[]): ExtensionAction {
  return {
    type: AFTER_GET_CHAPTERS,
    payload: {
      chapters,
    },
  };
}

// eslint-disable-next-line import/prefer-default-export
export function beforeImportSeries(): ExtensionAction {
  return {
    type: BEFORE_IMPORT_SERIES,
    payload: {},
  };
}

// eslint-disable-next-line import/prefer-default-export
export function afterImportSeries(): ExtensionAction {
  return {
    type: AFTER_IMPORT_SERIES,
    payload: {},
  };
}
