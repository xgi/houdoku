import React from 'react';
import { Language, LanguageKey, Languages } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { useRecoilState } from 'recoil';
import { Box, Center, Group, Stack } from '@mantine/core';
import { IconArrowBack, IconCloud, IconMoon, IconSun } from '@tabler/icons';
import { GeneralSetting, Theme } from '@/common/models/types';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { createBackup, restoreBackup } from '@/renderer/util/backup';
import {
  autoBackupState,
  autoBackupCountState,
  autoCheckForUpdatesState,
  chapterLanguagesState,
  confirmRemoveSeriesState,
  customDownloadsDirState,
  libraryCropCoversState,
  refreshOnStartState,
  themeState,
} from '@/renderer/state/settingStates';
import DefaultButton from '@/renderer/components/general/DefaultButton';
import DefaultInput from '../general/DefaultInput';
import DefaultText from '../general/DefaultText';
import DefaultCheckbox from '../general/DefaultCheckbox';
import DefaultSegmentedControl from '../general/DefaultSegmentedControl';
import DefaultNumberInput from '../general/DefaultNumberInput';
import DefaultMultiSelect from '../general/DefaultMultiSelect';

const languageOptions = Object.values(Languages)
  .filter((language) => language.key !== LanguageKey.MULTI)
  .map((language: Language) => ({ value: language.key, label: language.name }));

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

const GeneralSettings: React.FC = () => {
  const [theme, setTheme] = useRecoilState(themeState);
  const [chapterLanguages, setChapterLanguages] = useRecoilState(chapterLanguagesState);
  const [refreshOnStart, setRefreshOnStart] = useRecoilState(refreshOnStartState);
  const [autoCheckForUpdates, setAutoCheckForUpdates] = useRecoilState(autoCheckForUpdatesState);
  const [autoBackup, setAutoBackup] = useRecoilState(autoBackupState);
  const [autoBackupCount, setAutoBackupCount] = useRecoilState(autoBackupCountState);
  const [confirmRemoveSeries, setConfirmRemoveSeries] = useRecoilState(confirmRemoveSeriesState);
  const [libraryCropCovers, setLibraryCropCovers] = useRecoilState(libraryCropCoversState);
  const [customDownloadsDir, setCustomDownloadsDir] = useRecoilState(customDownloadsDirState);

  // biome-ignore lint/suspicious/noExplicitAny: arbitrary schema
  const updateGeneralSetting = (generalSetting: GeneralSetting, value: any) => {
    switch (generalSetting) {
      case GeneralSetting.Theme:
        setTheme(value);
        break;
      case GeneralSetting.ChapterLanguages:
        setChapterLanguages(value);
        break;
      case GeneralSetting.RefreshOnStart:
        setRefreshOnStart(value);
        break;
      case GeneralSetting.AutoCheckForUpdates:
        setAutoCheckForUpdates(value);
        break;
      case GeneralSetting.ConfirmRemoveSeries:
        setConfirmRemoveSeries(value);
        break;
      case GeneralSetting.LibraryCropCovers:
        setLibraryCropCovers(value);
        break;
      case GeneralSetting.CustomDownloadsDir:
        setCustomDownloadsDir(value);
        break;
      case GeneralSetting.autoBackup:
        setAutoBackup(value);
        break;
      case GeneralSetting.autoBackupCount:
        setAutoBackupCount(value);
        break;
      default:
        break;
    }
  };

  const handleRestoreBackup = () => {
    ipcRenderer
      .invoke(
        ipcChannels.APP.SHOW_OPEN_DIALOG,
        false,
        [
          {
            name: 'Houdoku Backup',
            extensions: ['json'],
          },
        ],
        'Select backup file',
      )
      .then((fileList: string) => {
        if (fileList.length > 0) {
          return ipcRenderer.invoke(ipcChannels.APP.READ_ENTIRE_FILE, fileList[0]);
        }
        return false;
      })
      .then((fileContent: string) => {
        if (fileContent) restoreBackup(fileContent);
      })
      .catch(console.error);
  };

  return (
    <>
      <DefaultText>Application</DefaultText>
      <Stack py="xs" ml="md" gap={4}>
        <DefaultCheckbox
          label="Check for Houdoku updates automatically"
          size="md"
          checked={autoCheckForUpdates}
          onChange={(e) =>
            updateGeneralSetting(GeneralSetting.AutoCheckForUpdates, e.target.checked)
          }
        />
        <DefaultSegmentedControl
          maw={400}
          data={[
            {
              value: Theme.Light,
              label: (
                <Center>
                  <IconSun size={16} />
                  <Box ml={10}>Light</Box>
                </Center>
              ),
            },
            {
              value: Theme.Dark,
              label: (
                <Center>
                  <IconCloud size={16} />
                  <Box ml={10}>Dark</Box>
                </Center>
              ),
            },
            {
              value: Theme.Black,
              label: (
                <Center>
                  <IconMoon size={16} />
                  <Box ml={10}>Black</Box>
                </Center>
              ),
            },
          ]}
          value={theme}
          onChange={(value) => updateGeneralSetting(GeneralSetting.Theme, value)}
        />
      </Stack>

      <DefaultText>Library</DefaultText>
      <Stack py="xs" ml="md" gap={4}>
        <DefaultCheckbox
          label="Refresh library on startup"
          size="md"
          checked={refreshOnStart}
          onChange={(e) => updateGeneralSetting(GeneralSetting.RefreshOnStart, e.target.checked)}
        />
        <DefaultCheckbox
          label="Confirm when removing series from library"
          size="md"
          checked={confirmRemoveSeries}
          onChange={(e) =>
            updateGeneralSetting(GeneralSetting.ConfirmRemoveSeries, e.target.checked)
          }
        />
        <DefaultCheckbox
          label="Crop cover images to library grid"
          size="md"
          checked={libraryCropCovers}
          onChange={(e) => updateGeneralSetting(GeneralSetting.LibraryCropCovers, e.target.checked)}
        />
        <DefaultMultiSelect
          label="Chapter languages"
          size="sm"
          data={languageOptions}
          placeholder="Select languages (leave blank for all)"
          searchable
          value={chapterLanguages}
          onChange={(value) => updateGeneralSetting(GeneralSetting.ChapterLanguages, value)}
        />
        <DefaultInput
          label={'Custom download location'}
          component="button"
          rightSectionPointerEvents="all"
          rightSection={
            <IconArrowBack
              size={20}
              style={{ display: 'block', opacity: 0.5 }}
              onClick={() => updateGeneralSetting(GeneralSetting.CustomDownloadsDir, '')}
            />
          }
          onClick={() =>
            ipcRenderer
              .invoke(ipcChannels.APP.SHOW_OPEN_DIALOG, true, [], 'Select Downloads Directory')
              .then((fileList: string) => {
                if (fileList.length > 0) {
                  updateGeneralSetting(GeneralSetting.CustomDownloadsDir, fileList[0]);
                }
              })
          }
        >
          {customDownloadsDir || defaultDownloadsDir}
        </DefaultInput>
      </Stack>
      <DefaultText>Backup</DefaultText>
      <Stack py="xs" ml="md" gap={4}>
        <Group gap="sm">
          <DefaultButton onClick={createBackup}>Create Backup</DefaultButton>
          <DefaultButton onClick={handleRestoreBackup}>Restore Backup</DefaultButton>
        </Group>
        <Group gap="sm" mt="xs">
          <DefaultCheckbox
            label="Automatically backup library"
            description={`Create up to ${autoBackupCount} daily backups`}
            size="md"
            checked={autoBackup}
            onChange={(e) => updateGeneralSetting(GeneralSetting.autoBackup, e.target.checked)}
          />
          <DefaultNumberInput
            w={100}
            ml={'xs'}
            value={autoBackupCount}
            min={1}
            disabled={!autoBackup}
            onChange={(value) => updateGeneralSetting(GeneralSetting.autoBackupCount, value)}
          />
        </Group>
      </Stack>
    </>
  );
};

export default GeneralSettings;
