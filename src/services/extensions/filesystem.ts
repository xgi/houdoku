import path from 'path';
import {
  GetSeriesFunc,
  GetChaptersFunc,
  GetPageRequesterDataFunc,
  GetPageUrlsFunc,
  GetSearchFunc,
  GetPageDataFunc,
  ExtensionMetadata,
  PageRequesterData,
  GetDirectoryFunc,
  Chapter,
  LanguageKey,
  Series,
  SeriesSourceType,
  SeriesStatus,
  DemographicKey,
} from 'houdoku-extension-lib';
import { getArchiveFileBase64, getArchiveFiles } from '../../util/archives';
import { walk } from '../../util/filesystem';

const METADATA: ExtensionMetadata = {
  id: '9ef3242e-b5a0-4f56-bf2f-5e0c9f6f50ab',
  name: 'filesystem',
  url: '',
  version: '1.0.0',
  notice: 'Add a series by selecting the directory or archive file below.',
  noticeUrl: 'https://github.com/xgi/houdoku/wiki/Importing-Local-Series',
  pageLoadMessage: '',
};

const getSeries: GetSeriesFunc = (sourceType: SeriesSourceType, id: string) => {
  const dirName = path.basename(id);
  const matchTitle: RegExpMatchArray | null = dirName.match(
    new RegExp(/(?:(?![v\d|c\d]).)*/g)
  );
  const title: string = matchTitle === null ? id : matchTitle[0];

  const series: Series = {
    id: undefined,
    extensionId: METADATA.id,
    sourceId: id,
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
    demographic: DemographicKey.UNCERTAIN,
    status: SeriesStatus.COMPLETED,
    originalLanguageKey: LanguageKey.JAPANESE,
    numberUnread: 0,
    remoteCoverUrl: '',
    userTags: [],
  };

  return new Promise((resolve) => {
    resolve(series);
  });
};

const getChapters: GetChaptersFunc = (
  sourceType: SeriesSourceType,
  id: string
) => {
  let fileListPromise;
  if (sourceType === SeriesSourceType.STANDARD) {
    fileListPromise = new Promise<string[]>((resolve) => {
      resolve(walk(id));
    });
  } else {
    fileListPromise = getArchiveFiles(id);
  }

  return fileListPromise.then((fileList: string[]) => {
    const imageDirectories: Set<string> = new Set();
    fileList.forEach((file: string) => {
      imageDirectories.add(path.dirname(file));
    });

    const chapters: Chapter[] = [];

    let prevChapterNum = 0;
    Array.from(imageDirectories).forEach((directory: string) => {
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
  });
};

const getPageRequesterData: GetPageRequesterDataFunc = (
  sourceType: SeriesSourceType,
  seriesSourceId: string,
  chapterSourceId: string
) => {
  let fileListPromise;
  if (sourceType === SeriesSourceType.STANDARD) {
    fileListPromise = new Promise<string[]>((resolve, reject) => {
      resolve(walk(chapterSourceId));
    });
  } else {
    fileListPromise = getArchiveFiles(
      seriesSourceId
    ).then((fileList: string[]) =>
      fileList.filter((_path: string) => _path.startsWith(chapterSourceId))
    );
  }

  return fileListPromise.then((fileList: string[]) => {
    return new Promise((resolve) => {
      resolve({
        server: '',
        hash: '',
        numPages: fileList.length,
        pageFilenames: fileList,
      });
    });
  });
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

  return new Promise((resolve) => {
    resolve(url);
  });
};

const getSearch: GetSearchFunc = () => {
  return new Promise<Series[]>((resolve) => resolve([]));
};

const getDirectory: GetDirectoryFunc = () => {
  return new Promise<Series[]>((resolve) => resolve([]));
};

export default {
  METADATA,
  getSeries,
  getChapters,
  getPageRequesterData,
  getPageUrls,
  getPageData,
  getSearch,
  getDirectory,
};
