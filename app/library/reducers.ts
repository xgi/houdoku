import fs from 'fs';
import path from 'path';
import {
  LibraryState,
  UPDATE_SERIES_LIST,
  SAVE_LIBRARY,
  READ_LIBRARY,
  DELETE_LIBRARY,
  CHANGE_NUM_COLUMNS,
  SET_CHAPTER_READ,
} from './types';
import persistantStore from '../utils/persistantStore';
import Library from '../models/library';
import Series from '../models/Series';
import Chapter from '../models/Chapter';

const { app } = require('electron').remote;

const dummyDescription = `
As leaders of their prestigious academy’s student council, Kaguya and Miyuki are the elite of the elite! But it’s lonely at the top… Luckily for them, they’ve fallen in love! There’s just one problem—they both have too much pride to admit it. And so begins the daily scheming to get the object of their affection to confess their romantic feelings first… Love is a war you win by losing.

(Source: Viz)

The first 10 chapters were published in the monthly Miracle Jump. It switched to Weekly Young Jump starting with Ch. 11.

Extra chapters:
Extra Chapter (Ch. 5.1). Published in 2015.09.03 in Weekly Young Jump to promote the (then new) series. It was included in the fanbook, but not in any volumes. Summary: Kaguya and Miyuki have a mindgame on their way to the Student Council room.

Extra Chapter (Ch. 27.1). Published in 2016.07.19 in Miracle Jump, it's a side-story to the main series. It was included in the fanbook, but not in any volumes. Summary: The student council wants to eat instant ramen without outsiders knowledge.

Kaguya Wants to be Confessed to Darkness (Ch. 64.1). Published in 2017.05.18 in Young Jump GOLD, it's a side-story to the main series. Not included in any volumes. Summary: Yu complains about manga fanservice as the girls are taking a bath.

Kaguya Wants to be Confessed to Darkness Vol.2 (Ch. 83.1). Published in 2017.10.19 in Young Jump GOLD, it's a side-story to the main series. Not included in any volumes. Summary: Yu and Miyuki comments on a stray porn mag.`;

function saveLibrary() {
  const myLibrary = new Library();
  const series1 = new Series(
    'Kaguya-sama wa Kokurasetai: Tensai-tachi no Renai Zunousen',
    'Akasaka Aka',
    dummyDescription
  );
  myLibrary.addSeries(series1);

  for (let i = 2; i < 200; i += 1) {
    const series = new Series(
      `seriestitle${i}`,
      `seriesauthor${i}`,
      dummyDescription
    );

    for (let c = 1; c < 250; c += 1) {
      const chapter = new Chapter(
        `chaptertitle${c}`,
        1,
        c,
        'groupname',
        'english'
      );
      series.addChapter(chapter);
    }

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

function setChapterRead(chapter: Chapter, read: boolean, _library: Library) {
  console.log(chapter);
  chapter.read = read;
}

const initialState: LibraryState = {
  seriesList: [],
  columns: 6,
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
    case SET_CHAPTER_READ:
      alert('second');
      setChapterRead(
        action.payload.chapter,
        action.payload.read,
        state.library
      );
      return { ...state, library: state.library };
    default:
      return state;
  }
}
