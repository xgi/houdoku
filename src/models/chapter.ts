import { v4 as uuidv4 } from 'uuid';

export default class Chapter {
  title: string;

  volumeNumber: number;

  chapterNumber: number;

  read: boolean;

  group: string;

  language: string;

  uuid: string;

  constructor(
    title: string,
    volumeNumber: number,
    chapterNumber: number,
    group: string,
    language: string
  ) {
    this.title = title;
    this.volumeNumber = volumeNumber;
    this.chapterNumber = chapterNumber;
    this.group = group;
    this.language = language;
    this.read = false;
    this.uuid = uuidv4();
  }
}
