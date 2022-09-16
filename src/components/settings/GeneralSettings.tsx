import React from 'react';
import { Language, LanguageKey, Languages } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import { useRecoilState } from 'recoil';
import { Button, Grid, Group, Input, MultiSelect, Switch } from '@mantine/core';
import { IconArrowBack } from '@tabler/icons';
import { GeneralSetting } from '../../models/types';
import ipcChannels from '../../constants/ipcChannels.json';
import { createBackup, restoreBackup } from '../../util/backup';
import {
  autoCheckForExtensionUpdatesState,
  autoCheckForUpdatesState,
  chapterLanguagesState,
  confirmRemoveSeriesState,
  customDownloadsDirState,
  refreshOnStartState,
} from '../../state/settingStates';

const languageOptions = Object.values(Languages)
  .filter((language) => language.key !== LanguageKey.MULTI)
  .map((language: Language) => ({ value: language.key, label: language.name }));

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const GeneralSettings: React.FC<Props> = (props: Props) => {
  const [chapterLanguages, setChapterLanguages] = useRecoilState(chapterLanguagesState);
  const [refreshOnStart, setRefreshOnStart] = useRecoilState(refreshOnStartState);
  const [autoCheckForUpdates, setAutoCheckForUpdates] = useRecoilState(autoCheckForUpdatesState);
  const [autoCheckForExtensionUpdates, setAutoCheckForExtensionUpdates] = useRecoilState(
    autoCheckForExtensionUpdatesState
  );
  const [confirmRemoveSeries, setConfirmRemoveSeries] = useRecoilState(confirmRemoveSeriesState);
  const [customDownloadsDir, setCustomDownloadsDir] = useRecoilState(customDownloadsDirState);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateGeneralSetting = (generalSetting: GeneralSetting, value: any) => {
    switch (generalSetting) {
      case GeneralSetting.ChapterLanguages:
        setChapterLanguages(value);
        break;
      case GeneralSetting.RefreshOnStart:
        setRefreshOnStart(value);
        break;
      case GeneralSetting.AutoCheckForUpdates:
        setAutoCheckForUpdates(value);
        break;
      case GeneralSetting.AutoCheckForExtensionUpdates:
        setAutoCheckForExtensionUpdates(value);
        break;
      case GeneralSetting.ConfirmRemoveSeries:
        setConfirmRemoveSeries(value);
        break;
      case GeneralSetting.CustomDownloadsDir:
        setCustomDownloadsDir(value);
        break;
      default:
        break;
    }
  };

  return (
    <Grid mb="md">
      <Grid.Col span={5}>Chapter languages</Grid.Col>
      <Grid.Col span={7}>
        <MultiSelect
          data={languageOptions}
          placeholder="Select languages (leave blank for all)"
          searchable
          value={chapterLanguages}
          onChange={(value) => updateGeneralSetting(GeneralSetting.ChapterLanguages, value)}
        />
      </Grid.Col>

      <Grid.Col span={5}>Refresh library on startup</Grid.Col>
      <Grid.Col span={7}>
        <Switch
          size="md"
          checked={refreshOnStart}
          onChange={(e) => updateGeneralSetting(GeneralSetting.RefreshOnStart, e.target.checked)}
        />
      </Grid.Col>

      <Grid.Col span={5}>Check for Houdoku updates automatically</Grid.Col>
      <Grid.Col span={7}>
        <Switch
          size="md"
          checked={autoCheckForUpdates}
          onChange={(e) =>
            updateGeneralSetting(GeneralSetting.AutoCheckForUpdates, e.target.checked)
          }
        />
      </Grid.Col>

      <Grid.Col span={5}>Check for extension updates automatically</Grid.Col>
      <Grid.Col span={7}>
        <Switch
          size="md"
          checked={autoCheckForExtensionUpdates}
          onChange={(e) =>
            updateGeneralSetting(GeneralSetting.AutoCheckForExtensionUpdates, e.target.checked)
          }
        />
      </Grid.Col>

      <Grid.Col span={5}>Confirm removing series from library</Grid.Col>
      <Grid.Col span={7}>
        <Switch
          size="md"
          checked={confirmRemoveSeries}
          onChange={(e) =>
            updateGeneralSetting(GeneralSetting.ConfirmRemoveSeries, e.target.checked)
          }
        />
      </Grid.Col>

      <Grid.Col span={5}>Custom downloads location</Grid.Col>
      <Grid.Col span={7}>
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
                // eslint-disable-next-line promise/always-return
                if (fileList.length > 0) {
                  updateGeneralSetting(GeneralSetting.CustomDownloadsDir, fileList[0]);
                }
              })
          }
        >
          {customDownloadsDir || defaultDownloadsDir}
        </Input>
      </Grid.Col>

      <Grid.Col span={5}>Backup library</Grid.Col>
      <Grid.Col span={7}>
        <Group spacing="sm">
          <Button variant="default" onClick={createBackup}>
            Create Backup
          </Button>
          <Button
            variant="default"
            onClick={() =>
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
                  'Select backup file'
                )
                .then((fileList: string) => {
                  // eslint-disable-next-line promise/always-return
                  if (fileList.length > 0) {
                    return ipcRenderer.invoke(ipcChannels.APP.READ_ENTIRE_FILE, fileList[0]);
                  }
                  return false;
                })
                .then((fileContent: string) => {
                  // eslint-disable-next-line promise/always-return
                  if (fileContent) restoreBackup(fileContent);
                })
            }
          >
            Restore Backup
          </Button>
        </Group>
      </Grid.Col>
    </Grid>
  );
};

export default GeneralSettings;
