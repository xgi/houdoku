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
  ExtensionClientAbstract,
  GetSettingsFunc,
  SetSettingsFunc,
  GetSettingTypesFunc,
  SeriesListResponse,
} from 'houdoku-extension-lib';
import { extract, getArchiveFiles } from '../../util/archives';
import { walk } from '../../util/filesystem';
import { IMAGE_EXTENSIONS } from '../../constants/constants.json';

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
  extractPath?: string = undefined;

  setExtractPath = (extractPath: string) => {
    this.extractPath = extractPath;
  };

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
      tagKeys: [],
      status: SeriesStatus.COMPLETED,
      originalLanguageKey: LanguageKey.JAPANESE,
      numberUnread: 0,
      remoteCoverUrl: '',
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

    return fileListPromise.then(async (fileList: string[]) => {
      const collator = new Intl.Collator([], { numeric: true });
      const imageFileList = fileList
        .filter((file) =>
          IMAGE_EXTENSIONS.some((ext) => file.endsWith(`.${ext}`))
        )
        .sort((a, b) => collator.compare(path.basename(a), path.basename(b)));

      if (isArchive && this.extractPath) {
        const extractedFilenames = await extract(
          chapterSourceId,
          imageFileList,
          this.extractPath
        );
        return {
          server: '',
          hash: '',
          numPages: extractedFilenames.length,
          pageFilenames: extractedFilenames,
        };
      } else {
        return new Promise((resolve) => {
          resolve({
            server: '',
            hash: '',
            numPages: imageFileList.length,
            pageFilenames: imageFileList,
          });
        });
      }
    });
  };

  getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) => {
    return pageRequesterData.pageFilenames;
  };

  getPageData: GetPageDataFunc = (_series: Series, url: string) => {
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
