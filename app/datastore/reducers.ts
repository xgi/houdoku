import fs from 'fs';
import path from 'path';
import { Series } from '../models/types';
import {
  DatabaseState,
  BEFORE_LOAD_SERIES_LIST,
  AFTER_LOAD_SERIES_LIST,
  BEFORE_LOAD_SERIES,
  AFTER_LOAD_SERIES,
  AFTER_LOAD_CHAPTER_LIST,
  BEFORE_LOAD_CHAPTER_LIST,
  AFTER_ADD_SERIES,
  BEFORE_ADD_SERIES,
} from './types';

const { app } = require('electron').remote;

const initialState: DatabaseState = {
  fetchingSeriesList: false,
  fetchingSeries: false,
  fetchingChapterList: false,
  addingSeries: false,
  seriesList: [],
  series: undefined,
  chapterList: [],
  addedSeries: undefined,
};

function downloadCover(series: Series) {
  const thumbnailsDir = path.join(app.getPath('userData'), 'thumbnails');
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir);
  }

  const ext = series.remoteCoverUrl.split('.').pop();
  // eslint-disable-next-line promise/catch-or-return
  fetch(series.remoteCoverUrl)
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      fs.writeFile(
        path.join(thumbnailsDir, `${series.id}.${ext}`),
        Buffer.from(buffer),
        (err) => {
          if (err) {
            alert(err);
          } else {
            console.log('Saved file');
          }
        }
      );
      return true;
    });
}

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
    case BEFORE_LOAD_CHAPTER_LIST:
      return { ...state, fetchingChapterList: true };
    case AFTER_LOAD_CHAPTER_LIST:
      return {
        ...state,
        fetchingChapterList: false,
        chapterList: action.payload.response,
      };
    case BEFORE_ADD_SERIES:
      return { ...state, addingSeries: true, addedSeries: undefined };
    case AFTER_ADD_SERIES:
      downloadCover(action.payload.addedSeries);
      return {
        ...state,
        addingSeries: false,
        addedSeries: action.payload.addedSeries,
      };
    default:
      return state;
  }
}
