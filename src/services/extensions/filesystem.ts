import { ipcRenderer } from 'electron';
import path from 'path';
import {
  Chapter,
  LanguageKey,
  Series,
  SeriesSourceType,
  SeriesStatus,
} from '../../models/types';
import { getArchiveFileBase64, getArchiveFiles } from '../../util/archives';
import {
  FetchSeriesFunc,
  FetchChaptersFunc,
  ParseSeriesFunc,
  ParseChaptersFunc,
  ParsePageRequesterDataFunc,
  FetchPageRequesterDataFunc,
  GetPageUrlsFunc,
  FetchSearchFunc,
  ParseSearchFunc,
  GetPageDataFunc,
} from './interface';
import { ExtensionMetadata, PageRequesterData } from './types';

const METADATA: ExtensionMetadata = {
  id: 1,
  name: 'filesystem',
  url: '',
  version: 1,
  notice: 'Add a series by selecting the directory or archive file below.',
  noticeUrl: 'https://github.com/xgi/houdoku/wiki/Importing-Local-Series',
};

const fetchSeries: FetchSeriesFunc = (
  sourceType: SeriesSourceType,
  id: string
) => {
  return new Promise((resolve, reject) => {
    const data = { path: id };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const init = { status: 200 };
    resolve(new Response(blob, init));
  });
};

const parseSeries: ParseSeriesFunc = (
  sourceType: SeriesSourceType,
  json: any
): Series => {
  const dirName = path.basename(json.path);
  const matchTitle: RegExpMatchArray | null = dirName.match(
    new RegExp(/(?:(?![v\d|c\d]).)*/g)
  );
  const title: string = matchTitle === null ? json.path : matchTitle[0];

  const series: Series = {
    id: undefined,
    extensionId: METADATA.id,
    sourceId: json.path,
    sourceType,
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
    originalLanguageKey: LanguageKey.JAPANESE,
    numberUnread: 0,
    remoteCoverUrl: '',
    userTags: [],
  };
  return series;
};

const fetchChapters: FetchChaptersFunc = (
  sourceType: SeriesSourceType,
  id: string
) => {
  let fileListPromise;
  if (sourceType === SeriesSourceType.STANDARD) {
    fileListPromise = ipcRenderer.invoke('get-all-files', id);
  } else {
    fileListPromise = getArchiveFiles(id);
  }

  return fileListPromise.then((fileList: string[]) => {
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

const parseChapters: ParseChaptersFunc = (
  sourceType: SeriesSourceType,
  json: any
): Chapter[] => {
  const chapters: Chapter[] = [];

  let prevChapterNum = 0;
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
    const matchAnyNum: RegExpMatchArray | null = dirName.match(
      new RegExp(/(\d)+/g)
    );

    let chapterNum = '';
    if (matchChapterNum === null) {
      if (matchAnyNum === null) {
        chapterNum = Math.floor(prevChapterNum + 1).toString();
      } else {
        chapterNum = parseFloat(matchAnyNum[0]).toString();
      }
    } else {
      chapterNum = parseFloat(matchChapterNum[0].replace('c', '')).toString();
    }

    const volumeNum: string =
      matchVolumeNum === null
        ? ''
        : parseFloat(matchVolumeNum[0].replace('v', '')).toString();
    const group: string =
      matchGroup === null
        ? ''
        : matchGroup[0].replace('[', '').replace(']', '');

    prevChapterNum = parseFloat(chapterNum);
    chapters.push({
      id: undefined,
      seriesId: undefined,
      sourceId: directory,
      title: dirName,
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
  sourceType: SeriesSourceType,
  seriesSourceId: string,
  chapterSourceId: string
) => {
  let fileListPromise;
  if (sourceType === SeriesSourceType.STANDARD) {
    fileListPromise = ipcRenderer.invoke('get-all-files', chapterSourceId);
  } else {
    fileListPromise = getArchiveFiles(
      seriesSourceId
    ).then((fileList: string[]) =>
      fileList.filter((_path: string) => _path.startsWith(chapterSourceId))
    );
  }

  return fileListPromise.then((fileList: string[]) => {
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

const getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) => {
  const pageUrls: string[] = [];
  for (let i = 0; i < pageRequesterData.numPages; i += 1) {
    pageUrls.push(`${pageRequesterData.pageFilenames[i]}`);
  }
  return pageUrls;
};

const getPageData: GetPageDataFunc = (series: Series, url: string) => {
  if (series.sourceType === SeriesSourceType.ARCHIVE) {
    const archiveFile = series.sourceId;
    return getArchiveFileBase64(archiveFile, url).then(
      (data: any) => `data:image/png;base64,${data}`
    );
  }

  return new Promise((resolve, reject) => {
    resolve(url);
  });
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
  getPageData,
  fetchSearch,
  parseSearch,
};
