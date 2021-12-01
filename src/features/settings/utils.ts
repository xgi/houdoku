import log from 'electron-log';
import { LanguageKey, SeriesStatus } from 'houdoku-extension-lib';
import {
  GeneralSetting,
  IntegrationSetting,
  ReadingDirection,
  PageStyle,
  ProgressFilter,
  ReaderSetting,
  TrackerSetting,
} from '../../models/types';
import persistantStore from '../../util/persistantStore';
import storeKeys from '../../constants/storeKeys.json';

export const DEFAULT_GENERAL_SETTINGS = {
  [GeneralSetting.ChapterLanguages]: [],
  [GeneralSetting.RefreshOnStart]: true,
  [GeneralSetting.AutoCheckForUpdates]: true,
  [GeneralSetting.AutoCheckForExtensionUpdates]: true,
  [GeneralSetting.CustomDownloadsDir]: '',
  [GeneralSetting.LibraryColumns]: 4,
  [GeneralSetting.LibraryFilterStatus]: null,
  [GeneralSetting.LibraryFilterProgress]: ProgressFilter.All,
  [GeneralSetting.LibraryFilterUserTags]: [],
};

export const DEFAULT_READER_SETTINGS = {
  [ReaderSetting.ReadingDirection]: ReadingDirection.LeftToRight,
  [ReaderSetting.PageStyle]: PageStyle.Single,
  [ReaderSetting.FitContainToWidth]: true,
  [ReaderSetting.FitContainToHeight]: true,
  [ReaderSetting.FitStretch]: false,
  [ReaderSetting.PreloadAmount]: 2,
  [ReaderSetting.OverlayPageNumber]: false,
  [ReaderSetting.HideScrollbar]: false,
  [ReaderSetting.KeyPreviousPage]: 'left',
  [ReaderSetting.KeyFirstPage]: 'ctrl+left',
  [ReaderSetting.KeyNextPage]: 'right',
  [ReaderSetting.KeyLastPage]: 'ctrl+right',
  [ReaderSetting.KeyScrollUp]: 'up',
  [ReaderSetting.KeyScrollDown]: 'down',
  [ReaderSetting.KeyPreviousChapter]: '[',
  [ReaderSetting.KeyNextChapter]: ']',
  [ReaderSetting.KeyToggleReadingDirection]: 'd',
  [ReaderSetting.KeyTogglePageStyle]: 'q',
  [ReaderSetting.KeyToggleShowingSettingsModal]: 'o',
  [ReaderSetting.KeyToggleShowingSidebar]: 's',
  [ReaderSetting.KeyExit]: 'backspace',
  [ReaderSetting.KeyCloseOrBack]: 'escape',
};

export const DEFAULT_TRACKER_SETTINGS = {
  [TrackerSetting.TrackerAutoUpdate]: true,
};

export const DEFAULT_INTEGRATION_SETTINGS = {
  [IntegrationSetting.DiscordPresenceEnabled]: false,
};

const getStoreValues = (
  storePrefix: string,
  settingEnum:
    | typeof GeneralSetting
    | typeof ReaderSetting
    | typeof TrackerSetting
    | typeof IntegrationSetting
): {
  [key in
    | GeneralSetting
    | ReaderSetting
    | TrackerSetting
    | IntegrationSetting]?: string | null;
} => {
  const values: {
    [key in
      | GeneralSetting
      | ReaderSetting
      | TrackerSetting
      | IntegrationSetting]?: string | null;
  } = {};
  Object.values(settingEnum).forEach(
    (
      setting:
        | GeneralSetting
        | ReaderSetting
        | TrackerSetting
        | IntegrationSetting
    ) => {
      values[setting] = persistantStore.read(`${storePrefix}${setting}`);
    }
  );

  return values;
};

export function getStoredGeneralSettings(): { [key in GeneralSetting]?: any } {
  const settings: { [key in GeneralSetting]?: any } = {};
  const storeValues = getStoreValues(
    storeKeys.SETTINGS.GENERAL_PREFIX,
    GeneralSetting
  );

  if (storeValues[GeneralSetting.ChapterLanguages] !== null) {
    settings[GeneralSetting.ChapterLanguages] = storeValues[
      GeneralSetting.ChapterLanguages
    ]
      ? (storeValues[GeneralSetting.ChapterLanguages]?.split(
          ','
        ) as LanguageKey[])
      : [];
  }
  if (storeValues[GeneralSetting.RefreshOnStart] !== null) {
    settings[GeneralSetting.RefreshOnStart] =
      storeValues[GeneralSetting.RefreshOnStart] === 'true';
  }
  if (storeValues[GeneralSetting.AutoCheckForUpdates] !== null) {
    settings[GeneralSetting.AutoCheckForUpdates] =
      storeValues[GeneralSetting.AutoCheckForUpdates] === 'true';
  }
  if (storeValues[GeneralSetting.AutoCheckForExtensionUpdates] !== null) {
    settings[GeneralSetting.AutoCheckForExtensionUpdates] =
      storeValues[GeneralSetting.AutoCheckForExtensionUpdates] === 'true';
  }
  if (storeValues[GeneralSetting.CustomDownloadsDir] !== null) {
    settings[GeneralSetting.CustomDownloadsDir] =
      storeValues[GeneralSetting.CustomDownloadsDir];
  }
  if (storeValues[GeneralSetting.LibraryColumns] !== null) {
    settings[GeneralSetting.LibraryColumns] = parseInt(
      storeValues[GeneralSetting.LibraryColumns] as string,
      10
    );
  }
  if (
    storeValues[GeneralSetting.LibraryFilterStatus] !== null &&
    storeValues[GeneralSetting.LibraryFilterStatus] !== 'null'
  ) {
    settings[GeneralSetting.LibraryFilterStatus] = storeValues[
      GeneralSetting.LibraryFilterStatus
    ] as SeriesStatus;
  }
  if (storeValues[GeneralSetting.LibraryFilterProgress] !== null) {
    settings[GeneralSetting.LibraryFilterProgress] = storeValues[
      GeneralSetting.LibraryFilterProgress
    ] as ProgressFilter;
  }
  if (storeValues[GeneralSetting.LibraryFilterUserTags] !== null) {
    const tags =
      storeValues[GeneralSetting.LibraryFilterUserTags]?.split(',') || [];
    if (tags.every((tag: string) => tag !== '')) {
      settings[GeneralSetting.LibraryFilterUserTags] = tags;
    }
  }

  log.debug(`Using general settings: ${JSON.stringify(settings)}`);
  return settings;
}

export function getStoredReaderSettings(): { [key in ReaderSetting]?: any } {
  const settings: { [key in ReaderSetting]?: any } = {};
  const storeValues = getStoreValues(
    storeKeys.SETTINGS.READER_PREFIX,
    ReaderSetting
  );

  if (storeValues[ReaderSetting.ReadingDirection] !== null) {
    settings[ReaderSetting.ReadingDirection] =
      storeValues[ReaderSetting.ReadingDirection];
  }
  if (storeValues[ReaderSetting.FitContainToWidth] !== null) {
    settings[ReaderSetting.FitContainToWidth] =
      storeValues[ReaderSetting.FitContainToWidth] === 'true';
  }
  if (storeValues[ReaderSetting.FitContainToHeight] !== null) {
    settings[ReaderSetting.FitContainToHeight] =
      storeValues[ReaderSetting.FitContainToHeight] === 'true';
  }
  if (storeValues[ReaderSetting.FitStretch] !== null) {
    settings[ReaderSetting.FitStretch] =
      storeValues[ReaderSetting.FitStretch] === 'true';
  }
  if (storeValues[ReaderSetting.PageStyle] !== null) {
    settings[ReaderSetting.PageStyle] = storeValues[ReaderSetting.PageStyle];
  }
  if (storeValues[ReaderSetting.PreloadAmount] !== null) {
    settings[ReaderSetting.PreloadAmount] = parseInt(
      storeValues[ReaderSetting.PreloadAmount] as string,
      10
    );
  }
  if (storeValues[ReaderSetting.OverlayPageNumber] !== null) {
    settings[ReaderSetting.OverlayPageNumber] =
      storeValues[ReaderSetting.OverlayPageNumber] === 'true';
  }
  if (storeValues[ReaderSetting.HideScrollbar] !== null) {
    settings[ReaderSetting.HideScrollbar] =
      storeValues[ReaderSetting.HideScrollbar] === 'true';
  }
  if (storeValues[ReaderSetting.KeyPreviousPage] !== null) {
    settings[ReaderSetting.KeyPreviousPage] =
      storeValues[ReaderSetting.KeyPreviousPage];
  }
  if (storeValues[ReaderSetting.KeyFirstPage] !== null) {
    settings[ReaderSetting.KeyFirstPage] =
      storeValues[ReaderSetting.KeyFirstPage];
  }
  if (storeValues[ReaderSetting.KeyNextPage] !== null) {
    settings[ReaderSetting.KeyNextPage] =
      storeValues[ReaderSetting.KeyNextPage];
  }
  if (storeValues[ReaderSetting.KeyLastPage] !== null) {
    settings[ReaderSetting.KeyLastPage] =
      storeValues[ReaderSetting.KeyLastPage];
  }
  if (storeValues[ReaderSetting.KeyScrollUp] !== null) {
    settings[ReaderSetting.KeyScrollUp] =
      storeValues[ReaderSetting.KeyScrollUp];
  }
  if (storeValues[ReaderSetting.KeyScrollDown] !== null) {
    settings[ReaderSetting.KeyScrollDown] =
      storeValues[ReaderSetting.KeyScrollDown];
  }
  if (storeValues[ReaderSetting.KeyPreviousChapter] !== null) {
    settings[ReaderSetting.KeyPreviousChapter] =
      storeValues[ReaderSetting.KeyPreviousChapter];
  }
  if (storeValues[ReaderSetting.KeyNextChapter] !== null) {
    settings[ReaderSetting.KeyNextChapter] =
      storeValues[ReaderSetting.KeyNextChapter];
  }
  if (storeValues[ReaderSetting.KeyToggleReadingDirection] !== null) {
    settings[ReaderSetting.KeyToggleReadingDirection] =
      storeValues[ReaderSetting.KeyToggleReadingDirection];
  }
  if (storeValues[ReaderSetting.KeyTogglePageStyle] !== null) {
    settings[ReaderSetting.KeyTogglePageStyle] =
      storeValues[ReaderSetting.KeyTogglePageStyle];
  }
  if (storeValues[ReaderSetting.KeyToggleShowingSettingsModal] !== null) {
    settings[ReaderSetting.KeyToggleShowingSettingsModal] =
      storeValues[ReaderSetting.KeyToggleShowingSettingsModal];
  }
  if (storeValues[ReaderSetting.KeyToggleShowingSidebar] !== null) {
    settings[ReaderSetting.KeyToggleShowingSidebar] =
      storeValues[ReaderSetting.KeyToggleShowingSidebar];
  }
  if (storeValues[ReaderSetting.KeyExit] !== null) {
    settings[ReaderSetting.KeyExit] = storeValues[ReaderSetting.KeyExit];
  }
  if (storeValues[ReaderSetting.KeyCloseOrBack] !== null) {
    settings[ReaderSetting.KeyCloseOrBack] =
      storeValues[ReaderSetting.KeyCloseOrBack];
  }

  log.debug(`Using reader settings: ${JSON.stringify(settings)}`);
  return settings;
}

export function getStoredTrackerSettings(): { [key in TrackerSetting]?: any } {
  const settings: { [key in TrackerSetting]?: any } = {};
  const storeValues = getStoreValues(
    storeKeys.SETTINGS.TRACKER_PREFIX,
    TrackerSetting
  );

  if (storeValues[TrackerSetting.TrackerAutoUpdate] !== null) {
    settings[TrackerSetting.TrackerAutoUpdate] =
      storeValues[TrackerSetting.TrackerAutoUpdate] === 'true';
  }

  log.debug(`Using tracker settings: ${JSON.stringify(settings)}`);
  return settings;
}

export function getStoredIntegrationSettings(): {
  [key in IntegrationSetting]?: any;
} {
  const settings: { [key in IntegrationSetting]?: any } = {};
  const storeValues = getStoreValues(
    storeKeys.SETTINGS.INTEGRATION_PREFIX,
    IntegrationSetting
  );

  if (storeValues[IntegrationSetting.DiscordPresenceEnabled] !== null) {
    settings[IntegrationSetting.DiscordPresenceEnabled] =
      storeValues[IntegrationSetting.DiscordPresenceEnabled] === 'true';
  }

  log.debug(`Using integration settings: ${JSON.stringify(settings)}`);
  return settings;
}

export function saveGeneralSetting(key: GeneralSetting, value: any) {
  persistantStore.write(`${storeKeys.SETTINGS.GENERAL_PREFIX}${key}`, value);
  log.info(`Set GeneralSetting ${key} to ${value}`);
}

export function saveReaderSetting(key: ReaderSetting, value: any) {
  persistantStore.write(`${storeKeys.SETTINGS.READER_PREFIX}${key}`, value);
  log.info(`Set ReaderSetting ${key} to ${value}`);
}

export function saveTrackerSetting(key: TrackerSetting, value: any) {
  persistantStore.write(`${storeKeys.SETTINGS.TRACKER_PREFIX}${key}`, value);
  log.info(`Set TrackerSetting ${key} to ${value}`);
}

export function saveIntegrationSetting(key: IntegrationSetting, value: any) {
  persistantStore.write(
    `${storeKeys.SETTINGS.INTEGRATION_PREFIX}${key}`,
    value
  );
  log.info(`Set IntegrationSetting ${key} to ${value}`);
}
