import { Series, Chapter } from '../models/types';

export const BEFORE_GET_SERIES = 'BEFORE_GET_SERIES';
export const AFTER_GET_SERIES = 'AFTER_GET_SERIES';
export const BEFORE_GET_CHAPTERS = 'BEFORE_GET_CHAPTERS';
export const AFTER_GET_CHAPTERS = 'AFTER_GET_CHAPTERS';
export const BEFORE_IMPORT_SERIES = 'BEFORE_IMPORT_SERIES';
export const AFTER_IMPORT_SERIES = 'AFTER_IMPORT_SERIES';

export interface ExtensionState {
  fetchingSeries: boolean;
  fetchingSeriesId: string;
  fetchingChapters: boolean;
  importingSeries: boolean;
  series?: Series;
  chapters: Chapter[];
}

interface BeforeGetSeriesAction {
  type: typeof BEFORE_GET_SERIES;
  payload: {
    id: string;
  };
}

interface AfterGetSeriesAction {
  type: typeof AFTER_GET_SERIES;
  payload: {
    series: Series;
  };
}

interface BeforeGetChaptersAction {
  type: typeof BEFORE_GET_CHAPTERS;
  payload: unknown;
}

interface AfterGetChaptersAction {
  type: typeof AFTER_GET_CHAPTERS;
  payload: {
    chapters: Chapter[];
  };
}

interface BeforeImportSeriesAction {
  type: typeof BEFORE_IMPORT_SERIES;
  payload: unknown;
}

interface AfterImportSeriesAction {
  type: typeof AFTER_IMPORT_SERIES;
  payload: unknown;
}

export type ExtensionAction =
  | BeforeGetSeriesAction
  | AfterGetSeriesAction
  | BeforeGetChaptersAction
  | AfterGetChaptersAction
  | BeforeImportSeriesAction
  | AfterImportSeriesAction;
