import { v4 as uuidv4 } from 'uuid';

export default class Series {
  title: string;

  author: string;

  description: string;

  uuid: string;

  constructor(title: string, author: string, description: string) {
    this.title = title;
    this.author = author;
    this.description = description;
    this.uuid = uuidv4();
  }
}
