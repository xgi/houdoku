import { ipcRenderer } from 'electron';
import path from 'path';
import { Chapter, LanguageKey, Series, SeriesStatus } from '../../models/types';
import {
  FetchSeriesFunc,
  FetchChaptersFunc,
  ParseSeriesFunc,
  ParseChaptersFunc,
  ParsePageRequesterDataFunc,
  FetchPageRequesterDataFunc,
  GetPageUrlsFunction,
} from './interface';
import { ExtensionMetadata, PageRequesterData } from './types';

const METADATA: ExtensionMetadata = {
  id: 1,
  name: 'filesystem',
  url: '',
  version: 1,
};

const fetchSeries: FetchSeriesFunc = (id: string) => {
  return new Promise((resolve, reject) => {
    const data = { path: id, title: id };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const init = { status: 200 };
    resolve(new Response(blob, init));
  });
};

const parseSeries: ParseSeriesFunc = (json: any): Series => {
  const series: Series = {
    id: undefined,
    extensionId: METADATA.id,
    sourceId: json.path,
    title: json.title,
    altTitles: [],
    description: '',
    authors: [],
    artists: [],
    genres: [],
    themes: [],
    formats: [],
    contentWarnings: [],
    status: SeriesStatus.COMPLETED,
    originalLanguageKey: LanguageKey.ENGLISH,
    remoteCoverUrl: '',
  };
  return series;
};

const fetchChapters: FetchChaptersFunc = (id: string) => {
  return ipcRenderer.invoke('get-all-files', id).then((fileList: string[]) => {
    const imageDirectories: Set<string> = new Set();
    fileList.forEach((file: string) => {
      imageDirectories.add(path.dirname(file));
    });

    return new Promise((resolve, reject) => {
      const data = { imageDirectories: Array.from(imageDirectories) };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const init = { status: 200 };
      resolve(new Response(blob, init));
    });
  });
};

const parseChapters: ParseChaptersFunc = (json: any): Chapter[] => {
  const chapters: Chapter[] = [];

  console.log(json);
  let num = 1;
  json.imageDirectories.forEach((directory: string) => {
    const title: string = path.basename(directory);

    chapters.push({
      id: undefined,
      seriesId: undefined,
      sourceId: directory,
      title,
      chapterNumber: num.toString(),
      volumeNumber: '1',
      languageKey: LanguageKey.ENGLISH,
      groupName: 'group',
      time: new Date().getTime(),
      read: false,
    });
    num += 1;
  });
  return chapters;
};

const fetchPageRequesterData: FetchPageRequesterDataFunc = (
  chapter_id: string
) => {
  return ipcRenderer
    .invoke('get-all-files', chapter_id)
    .then((fileList: string[]) => {
      const imageDirectories: Set<string> = new Set();
      return new Promise((resolve, reject) => {
        const data = { fileList };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const init = { status: 200 };
        resolve(new Response(blob, init));
      });
    });
};

const parsePageRequesterData: ParsePageRequesterDataFunc = (
  json: any
): PageRequesterData => {
  return {
    server: '',
    hash: '',
    numPages: json.fileList.length,
    pageFilenames: json.fileList,
  };
};

const getPageUrls: GetPageUrlsFunction = (
  pageRequesterData: PageRequesterData
) => {
  const pageUrls: string[] = [];
  for (let i = 0; i < pageRequesterData.numPages; i += 1) {
    pageUrls.push(`${pageRequesterData.pageFilenames[i]}`);
  }
  return pageUrls;
};

export default {
  METADATA,
  fetchSeries,
  parseSeries,
  fetchChapters,
  parseChapters,
  fetchPageRequesterData,
  parsePageRequesterData,
  getPageUrls,
};
