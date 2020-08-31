import fs from 'fs';
import path from 'path';
import { LibraryState } from '../types/states/libraryStateTypes';
import {
  UPDATE_SERIES_LIST,
  SAVE_LIBRARY,
  READ_LIBRARY,
  DELETE_LIBRARY,
  CHANGE_NUM_COLUMNS,
} from '../types/actions/libraryActionTypes';
import persistantStore from '../utils/persistantStore';
import Library from '../models/library';
import Series from '../models/Series';

const { app } = require('electron').remote;

function saveLibrary() {
  const myLibrary = new Library();
  const series1 = new Series(
    'Kaguya-sama wa Kokurasetai: Tensai-tachi no Renai Zunousen',
    'Akasaka Aka'
  );
  myLibrary.addSeries(series1);

  for (let i = 2; i < 200; i += 1) {
    const series = new Series(`seriestitle${i}`, `seriesauthor${i}`);
    myLibrary.addSeries(series);
  }

  const thumbnailsDir = path.join(app.getPath('userData'), 'thumbnails');
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir);
  }

  fs.writeFile(
    path.join(thumbnailsDir, `${series1.uuid}.png`),
    'this is the file contents',
    (err) => {
      if (err) {
        alert(err);
      } else {
        console.log('Saved file');
      }
    }
  );

  persistantStore.write('library', myLibrary);
}

function readLibrary() {
  return persistantStore.read('library');
}

function deleteLibrary() {
  persistantStore.write('library', null);
}

const initialState: LibraryState = {
  library: readLibrary(),
  columns: 4,
};

export default function library(
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): LibraryState {
  switch (action.type) {
    case UPDATE_SERIES_LIST:
      return { ...state, columns: 2 };
    case SAVE_LIBRARY:
      saveLibrary();
      return state;
    case READ_LIBRARY:
      return { ...state, library: readLibrary() };
    case DELETE_LIBRARY:
      deleteLibrary();
      return state;
    case CHANGE_NUM_COLUMNS:
      return { ...state, columns: action.payload.columns };
    default:
      return state;
  }
}
