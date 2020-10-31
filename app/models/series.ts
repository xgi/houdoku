import { v4 as uuidv4 } from 'uuid';
import Chapter from './chapter';

export default class Series {
  title: string;

  author: string;

  description: string;

  chapterList: Chapter[];

  uuid: string;

  constructor(title: string, author: string, description: string) {
    this.title = title;
    this.author = author;
    this.description = description;
    this.chapterList = [];
    this.uuid = uuidv4();
  }

  addChapter(chapter: Chapter) {
    this.chapterList.push(chapter);
  }
}
