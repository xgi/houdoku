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
  ExtensionClientAbstract,
  GetSettingsFunc,
  SetSettingsFunc,
  GetSettingTypesFunc,
  SeriesListResponse,
} from 'houdoku-extension-lib';
import { getArchiveFileBase64, getArchiveFiles } from '../../util/archives';
import { walk } from '../../util/filesystem';

export const FS_METADATA: ExtensionMetadata = {
  id: '9ef3242e-b5a0-4f56-bf2f-5e0c9f6f50ab',
  name: 'filesystem',
  url: '',
  version: '1.0.0',
  translatedLanguage: undefined,
  hasSettings: false,
  notice: 'Add a series by selecting the directory or archive file below.',
  noticeUrl: 'https://houdoku.org/docs/adding-manga/adding-local-series',
  pageLoadMessage: '',
};

const ARCHIVE_FILE_DELIMITER = '<archive>';

const isSupportedArchivePath = (str: string) => {
  return ['zip', 'rar', 'cbz', 'cbr'].some((ext) => {
    return str.endsWith(`.${ext}`);
  });
};

const parseChapterMetadata = (
  text: string
): {
  title: string;
  chapterNum: string;
  volumeNum: string;
  group: string;
} => {
  const matchChapterNum: RegExpMatchArray | null = text.match(
    new RegExp(/c(\d)+(\.(\d)+)?/g)
  );
  const matchVolumeNum: RegExpMatchArray | null = text.match(
    new RegExp(/v(\d)+/g)
  );
  const matchGroup: RegExpMatchArray | null = text.match(new RegExp(/\[.*\]/g));
  const matchAnyNum: RegExpMatchArray | null = text.match(new RegExp(/(\d)+/g));

  let chapterNum = '';
  if (matchChapterNum === null) {
    if (matchAnyNum !== null && matchVolumeNum === null) {
      chapterNum = parseFloat(matchAnyNum[0]).toString();
    }
  } else {
    const matchNumber = matchChapterNum[0].match(new RegExp(/(\d)+/g));
    chapterNum = matchNumber ? parseFloat(matchNumber[0]).toString() : '';
  }

  let volumeNum = '';
  if (matchVolumeNum !== null) {
    const matchNumber = matchVolumeNum[0].match(new RegExp(/(\d)+/g));
    volumeNum = matchNumber ? parseFloat(matchNumber[0]).toString() : '';
  }

  const group: string =
    matchGroup === null ? '' : matchGroup[0].replace('[', '').replace(']', '');

  return {
    title: text.trim(),
    chapterNum,
    volumeNum,
    group: group.trim(),
  };
};

export class FSExtensionClient extends ExtensionClientAbstract {
  getMetadata: () => ExtensionMetadata = () => {
    return FS_METADATA;
  };

  getSeries: GetSeriesFunc = (sourceType: SeriesSourceType, id: string) => {
    const dirName = path.basename(id);
    const series: Series = {
      id: undefined,
      extensionId: FS_METADATA.id,
      sourceId: id,
      sourceType,
      title: dirName.trim(),
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
      trackerKeys: {},
    };

    return new Promise((resolve) => {
      resolve(series);
    });
  };

  getChapters: GetChaptersFunc = (
    _sourceType: SeriesSourceType,
    id: string
  ) => {
    const fileList = walk(id);
    const chapterPaths: Set<string> = new Set();
    fileList.forEach((file: string) => {
      chapterPaths.add(path.dirname(file));

      if (isSupportedArchivePath(file)) {
        chapterPaths.add(file);
        chapterPaths.delete(path.dirname(file));
      }
    });

    const chapters: Chapter[] = Array.from(chapterPaths).map(
      (chapterPath: string) => {
        const metadata = parseChapterMetadata(path.basename(chapterPath));
        return {
          sourceId: chapterPath,
          title: metadata.title,
          chapterNumber: metadata.chapterNum,
          volumeNumber: metadata.volumeNum,
          languageKey: LanguageKey.ENGLISH,
          groupName: metadata.group,
          time: new Date().getTime(),
          read: false,
        };
      }
    );

    return new Promise((resolve) => {
      resolve(chapters);
    });
  };

  getPageRequesterData: GetPageRequesterDataFunc = (
    _sourceType: SeriesSourceType,
    _seriesSourceId: string,
    chapterSourceId: string
  ) => {
    const isArchive = isSupportedArchivePath(chapterSourceId);

    let fileListPromise;
    if (isArchive) {
      fileListPromise = getArchiveFiles(chapterSourceId);
    } else {
      fileListPromise = new Promise<string[]>((resolve) =>
        resolve(walk(chapterSourceId))
      );
    }

    return fileListPromise.then((fileList: string[]) => {
      const imageFileList = fileList.filter((file) =>
        ['png', 'jpg', 'jpeg'].some((ext) => file.endsWith(`.${ext}`))
      );
      return new Promise((resolve) => {
        resolve({
          server: isArchive ? chapterSourceId : '',
          hash: '',
          numPages: imageFileList.length,
          pageFilenames: imageFileList,
        });
      });
    });
  };

  getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) => {
    if (pageRequesterData.server === '') return pageRequesterData.pageFilenames;
    return pageRequesterData.pageFilenames.map(
      (pageFilename) =>
        `${pageRequesterData.server}${ARCHIVE_FILE_DELIMITER}${pageFilename}`
    );
  };

  getPageData: GetPageDataFunc = (_series: Series, url: string) => {
    if (url.includes(ARCHIVE_FILE_DELIMITER)) {
      const parts = url.split(ARCHIVE_FILE_DELIMITER);
      const archivePath = parts[0];
      const filename = parts[1];

      return getArchiveFileBase64(archivePath, filename).then(
        (data) => `data:image/png;base64,${data}`
      );
    }

    return new Promise((resolve) => {
      resolve(url);
    });
  };

  getSearch: GetSearchFunc = () => {
    return new Promise<SeriesListResponse>((resolve) =>
      resolve({ seriesList: [], hasMore: false })
    );
  };

  getDirectory: GetDirectoryFunc = () => {
    return new Promise<SeriesListResponse>((resolve) =>
      resolve({ seriesList: [], hasMore: false })
    );
  };

  getSettingTypes: GetSettingTypesFunc = () => {
    return {};
  };

  getSettings: GetSettingsFunc = () => {
    return {};
  };

  setSettings: SetSettingsFunc = () => {};
}
