import React from 'react';
import { Language, LanguageKey, Languages } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { useRecoilState } from 'recoil';
import {
  Box,
  Button,
  Center,
  Checkbox,
  Group,
  Input,
  MultiSelect,
  NumberInput,
  SegmentedControl,
  Stack,
  Text,
} from '@mantine/core';
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

const languageOptions = Object.values(Languages)
  .filter((language) => language.key !== LanguageKey.MULTI)
  .map((language: Language) => ({ value: language.key, label: language.name }));

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const GeneralSettings: React.FC<Props> = () => {
  const [theme, setTheme] = useRecoilState(themeState);
  const [chapterLanguages, setChapterLanguages] = useRecoilState(chapterLanguagesState);
  const [refreshOnStart, setRefreshOnStart] = useRecoilState(refreshOnStartState);
  const [autoCheckForUpdates, setAutoCheckForUpdates] = useRecoilState(autoCheckForUpdatesState);
  const [autoBackup, setAutoBackup] = useRecoilState(autoBackupState);
  const [autoBackupCount, setAutoBackupCount] = useRecoilState(autoBackupCountState);
  const [confirmRemoveSeries, setConfirmRemoveSeries] = useRecoilState(confirmRemoveSeriesState);
  const [libraryCropCovers, setLibraryCropCovers] = useRecoilState(libraryCropCoversState);
  const [customDownloadsDir, setCustomDownloadsDir] = useRecoilState(customDownloadsDirState);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <Text>Application</Text>
      <Stack py="xs" ml="md" gap={4}>
        <Checkbox
          label="Check for Houdoku updates automatically"
          size="md"
          checked={autoCheckForUpdates}
          onChange={(e) =>
            updateGeneralSetting(GeneralSetting.AutoCheckForUpdates, e.target.checked)
          }
        />
        <SegmentedControl
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

      <Text>Library</Text>
      <Stack py="xs" ml="md" gap={4}>
        <Checkbox
          label="Refresh library on startup"
          size="md"
          checked={refreshOnStart}
          onChange={(e) => updateGeneralSetting(GeneralSetting.RefreshOnStart, e.target.checked)}
        />
        <Checkbox
          label="Confirm when removing series from library"
          size="md"
          checked={confirmRemoveSeries}
          onChange={(e) =>
            updateGeneralSetting(GeneralSetting.ConfirmRemoveSeries, e.target.checked)
          }
        />
        <Checkbox
          label="Crop cover images to library grid"
          size="md"
          checked={libraryCropCovers}
          onChange={(e) => updateGeneralSetting(GeneralSetting.LibraryCropCovers, e.target.checked)}
        />
        <MultiSelect
          label="Chapter languages"
          size="sm"
          data={languageOptions}
          placeholder="Select languages (leave blank for all)"
          searchable
          value={chapterLanguages}
          onChange={(value) => updateGeneralSetting(GeneralSetting.ChapterLanguages, value)}
        />
        <Input.Wrapper label="Custom download location">
          <Input
            component="button"
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
          </Input>
        </Input.Wrapper>
      </Stack>
      <Text>Backup</Text>
      <Stack py="xs" ml="md" gap={4}>
        <Group gap="sm">
          <Button variant="default" onClick={createBackup}>
            Create Backup
          </Button>
          <Button variant="default" onClick={handleRestoreBackup}>
            Restore Backup
          </Button>
        </Group>
        <Group gap="sm" mt="xs">
          <Checkbox
            label="Automatically backup library"
            description={`Create up to ${autoBackupCount} daily backups`}
            size="md"
            checked={autoBackup}
            onChange={(e) => updateGeneralSetting(GeneralSetting.autoBackup, e.target.checked)}
          />
          <NumberInput
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
