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
  FetchSearchFunc,
  ParseSearchFunc,
} from './interface';
import { ExtensionMetadata, PageRequesterData } from './types';

const METADATA: ExtensionMetadata = {
  id: 1,
  name: 'filesystem',
  url: '',
  version: 1,
  notice: '',
};

const fetchSeries: FetchSeriesFunc = (id: string) => {
  return new Promise((resolve, reject) => {
    const data = { path: id };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const init = { status: 200 };
    resolve(new Response(blob, init));
  });
};

const parseSeries: ParseSeriesFunc = (json: any): Series => {
  const dirName = path.basename(json.path);
  const matchTitle: RegExpMatchArray | null = dirName.match(
    new RegExp(/(?:(?![v\d|c\d]).)*/g)
  );
  const title: string = matchTitle === null ? json.path : matchTitle[0];

  const series: Series = {
    id: undefined,
    extensionId: METADATA.id,
    sourceId: json.path,
    title,
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
    numberUnread: 0,
    remoteCoverUrl: '',
    userTags: [],
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

  json.imageDirectories.forEach((directory: string) => {
    const dirName: string = path.basename(directory);
    const matchChapterNum: RegExpMatchArray | null = dirName.match(
      new RegExp(/c(\d)+/g)
    );
    const matchVolumeNum: RegExpMatchArray | null = dirName.match(
      new RegExp(/v(\d)+/g)
    );
    const matchGroup: RegExpMatchArray | null = dirName.match(
      new RegExp(/\[.*\]/g)
    );

    if (matchChapterNum === null) return;
    const chapterNum: string = parseFloat(
      matchChapterNum[0].replace('c', '')
    ).toString();
    const volumeNum: string =
      matchVolumeNum === null
        ? ''
        : parseFloat(matchVolumeNum[0].replace('v', '')).toString();
    const group: string =
      matchGroup === null
        ? ''
        : matchGroup[0].replace('[', '').replace(']', '');

    chapters.push({
      id: undefined,
      seriesId: undefined,
      sourceId: directory,
      title: '',
      chapterNumber: chapterNum,
      volumeNumber: volumeNum,
      languageKey: LanguageKey.ENGLISH,
      groupName: group,
      time: new Date().getTime(),
      read: false,
    });
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

const fetchSearch: FetchSearchFunc = (
  text: string,
  params: { [key: string]: string }
) => {
  return new Promise((resolve, reject) => {
    const data = { text, params };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const init = { status: 200 };
    resolve(new Response(blob, init));
  });
};

const parseSearch: ParseSearchFunc = (json: any) => {
  return [];
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
  fetchSearch,
  parseSearch,
};
