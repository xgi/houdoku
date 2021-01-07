import { Chapter } from '../models/types';
import db from '../services/db';
import {
  getPageRequesterData,
  getPageUrlFunction,
} from '../services/extension';
import { PageRequesterData } from '../services/extensions/types';

// eslint-disable-next-line import/prefer-default-export
export function fetchPageUrlFunction(dispatch: any, chapter_id: number) {
  return db
    .fetchChapter(chapter_id)
    .then((response: any) => response[0])
    .then((chapter: Chapter) => getPageRequesterData(chapter.source_id))
    .then((pageRequesterData: PageRequesterData) =>
      getPageUrlFunction(pageRequesterData)
    );
}
