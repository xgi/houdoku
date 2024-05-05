import path from 'path';
import {
  GetSeriesFunc,
  GetChaptersFunc,
  GetPageRequesterDataFunc,
  GetPageUrlsFunc,
  GetSearchFunc,
  GetImageFunc,
  PageRequesterData,
  GetDirectoryFunc,
  Chapter,
  LanguageKey,
  Series,
  SeriesStatus,
  ExtensionClientAbstract,
  GetSettingsFunc,
  SetSettingsFunc,
  GetSettingTypesFunc,
  SeriesListResponse,
  GetFilterOptionsFunc,
} from '@tiyo/common';
import { extract } from '@/main/util/archives';
import { walk } from '@/main/util/filesystem';
import constants from '@/common/constants/constants.json';
import { FS_METADATA } from '@/common/temp_fs_metadata';

const isSupportedArchivePath = (str: string) => {
  return ['zip', 'rar', 'cbz', 'cbr'].some((ext) => {
    return str.endsWith(`.${ext}`);
  });
};

const filterImageFiles = (fileList: string[]) => {
  const collator = new Intl.Collator([], { numeric: true });
  return fileList
    .filter((file) => constants.IMAGE_EXTENSIONS.some((ext) => file.endsWith(`.${ext}`)))
    .sort((a, b) => collator.compare(path.basename(a), path.basename(b)));
};

const getPageRequesterDataFromArchive = async (
  archivePath: string,
  extractPath: string,
): Promise<PageRequesterData> => {
  const extractedFilenames = await extract(archivePath, extractPath);
  const imageFilenames = filterImageFiles(extractedFilenames);

  return {
    server: '',
    hash: '',
    numPages: imageFilenames.length,
    pageFilenames: imageFilenames,
  };
};

const getPageRequesterDataFromDirectory = async (dirPath: string): Promise<PageRequesterData> => {
  const fileList = walk(dirPath);
  const imageFileList = filterImageFiles(fileList);

  return new Promise((resolve) => {
    resolve({
      server: '',
      hash: '',
      numPages: imageFileList.length,
      pageFilenames: imageFileList,
    });
  });
};

const parseChapterMetadata = (
  text: string,
): {
  title: string;
  chapterNum: string;
  volumeNum: string;
  group: string;
} => {
  const matchChapterNum: RegExpMatchArray | null = text.match(/c\d*\.?\d+/g);
  const matchVolumeNum: RegExpMatchArray | null = text.match(/v(\d)+/g);
  const matchGroup: RegExpMatchArray | null = text.match(/\[.*\]/g);
  const matchAnyNum: RegExpMatchArray | null = text.match(/\d*\.?\d+/g);

  let chapterNum = '';
  if (matchChapterNum === null) {
    if (matchAnyNum !== null && matchVolumeNum === null) {
      chapterNum = parseFloat(matchAnyNum[0]).toString();
    }
  } else {
    const matchNumber = matchChapterNum[0].match(/\d*\.?\d+/g);
    chapterNum = matchNumber ? parseFloat(matchNumber[0]).toString() : '';
  }

  let volumeNum = '';
  if (matchVolumeNum !== null) {
    const matchNumber = matchVolumeNum[0].match(/(\d)+/g);
    volumeNum = matchNumber ? parseFloat(matchNumber[0]).toString() : '';
  }

  const group: string = matchGroup === null ? '' : matchGroup[0].replace('[', '').replace(']', '');

  return {
    title: text.trim(),
    chapterNum,
    volumeNum,
    group: group.trim(),
  };
};

// eslint-disable-next-line import/prefer-default-export
export class FSExtensionClient extends ExtensionClientAbstract {
  extractPath?: string = undefined;

  override getSeries: GetSeriesFunc = (id: string) => {
    const dirName = path.basename(id);
    const series: Series = {
      id: undefined,
      extensionId: FS_METADATA.id,
      sourceId: id,
      title: dirName.trim(),
      altTitles: [],
      description: '',
      authors: [],
      artists: [],
      tags: [],
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

  override getChapters: GetChaptersFunc = (id: string) => {
    const fileList = walk(id);
    const chapterPaths: Set<string> = new Set();
    fileList.forEach((file: string) => {
      chapterPaths.add(path.dirname(file));

      if (isSupportedArchivePath(file)) {
        chapterPaths.add(file);
        chapterPaths.delete(path.dirname(file));
      }
    });

    const chapters: Chapter[] = Array.from(chapterPaths).map((chapterPath: string) => {
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
    });

    return new Promise((resolve) => {
      resolve(chapters);
    });
  };

  override getPageRequesterData: GetPageRequesterDataFunc = (
    _seriesSourceId: string,
    chapterSourceId: string,
  ) => {
    const isArchive = isSupportedArchivePath(chapterSourceId);
    return isArchive
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        getPageRequesterDataFromArchive(chapterSourceId, this.extractPath!)
      : getPageRequesterDataFromDirectory(chapterSourceId);
  };

  override getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) => {
    return pageRequesterData.pageFilenames;
  };

  override getImage: GetImageFunc = (_series: Series, url: string) => {
    return new Promise((resolve) => {
      resolve(url);
    });
  };

  override getSearch: GetSearchFunc = () => {
    return new Promise<SeriesListResponse>((resolve) =>
      resolve({ seriesList: [], hasMore: false }),
    );
  };

  override getDirectory: GetDirectoryFunc = () => {
    return new Promise<SeriesListResponse>((resolve) =>
      resolve({ seriesList: [], hasMore: false }),
    );
  };

  override getSettingTypes: GetSettingTypesFunc = () => {
    return {};
  };

  override getSettings: GetSettingsFunc = () => {
    return {};
  };

  override setSettings: SetSettingsFunc = () => {};

  override getFilterOptions: GetFilterOptionsFunc = () => [];
}
export { FS_METADATA };
