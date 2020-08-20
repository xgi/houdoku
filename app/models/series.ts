import { v4 as uuidv4 } from 'uuid';

export default class Series {
  name: string;

  author: string;

  uuid: string;

  constructor(name: string, author: string) {
    this.name = name;
    this.author = author;
    this.uuid = uuidv4();
  }
}
