import { v4 as uuidv4 } from 'uuid';

export default class Chapter {
  title: string;

  volumeNumber: number;

  chapterNumber: number;

  read: boolean;

  uuid: string;

  constructor(title: string, volumeNumber: number, chapterNumber: number) {
    this.title = title;
    this.volumeNumber = volumeNumber;
    this.chapterNumber = chapterNumber;
    this.read = false;
    this.uuid = uuidv4();
  }
}
