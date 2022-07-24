import React from 'react';
import { Select, Col, Row, Button, Input, Tooltip, Switch } from 'antd';
import { SelectOutlined, UndoOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import { Language, LanguageKey, Languages } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import styles from './GeneralSettings.css';
import { GeneralSetting } from '../../models/types';
import { RootState } from '../../store';
import {
  setAutoCheckForExtensionUpdates,
  setAutoCheckForUpdates,
  setChapterLanguages,
  setCustomDownloadsDir,
  setRefreshOnStart,
} from '../../features/settings/actions';
import ipcChannels from '../../constants/ipcChannels.json';
import { createBackup, restoreBackup } from '../../util/backup';

const { Option } = Select;

const languageOptions = Object.values(Languages)
  .filter((language) => language.key !== LanguageKey.MULTI)
  .map((language: Language) => (
    <Option key={language.key} value={language.key}>
      {language.name}
    </Option>
  ));

const defaultDownloadsDir = await ipcRenderer.invoke(
  ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR
);

const mapState = (state: RootState) => ({
  chapterLanguages: state.settings.chapterLanguages,
  refreshOnStart: state.settings.refreshOnStart,
  autoCheckForUpdates: state.settings.autoCheckForUpdates,
  autoCheckForExtensionUpdates: state.settings.autoCheckForExtensionUpdates,
  customDownloadsDir: state.settings.customDownloadsDir,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setChapterLanguages: (chapterLanguages: LanguageKey[]) =>
    dispatch(setChapterLanguages(chapterLanguages)),
  setRefreshOnStart: (refreshOnStart: boolean) =>
    dispatch(setRefreshOnStart(refreshOnStart)),
  setAutoCheckForUpdates: (autoCheckForUpdates: boolean) =>
    dispatch(setAutoCheckForUpdates(autoCheckForUpdates)),
  setAutoCheckForExtensionUpdates: (autoCheckForExtensionUpdates: boolean) =>
    dispatch(setAutoCheckForExtensionUpdates(autoCheckForExtensionUpdates)),
  setCustomDownloadsDir: (customDownloadsDir: string) =>
    dispatch(setCustomDownloadsDir(customDownloadsDir)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const GeneralSettings: React.FC<Props> = (props: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateGeneralSetting = (generalSetting: GeneralSetting, value: any) => {
    switch (generalSetting) {
      case GeneralSetting.ChapterLanguages:
        props.setChapterLanguages(value);
        break;
      case GeneralSetting.RefreshOnStart:
        props.setRefreshOnStart(value);
        break;
      case GeneralSetting.AutoCheckForUpdates:
        props.setAutoCheckForUpdates(value);
        break;
      case GeneralSetting.AutoCheckForExtensionUpdates:
        props.setAutoCheckForExtensionUpdates(value);
        break;
      case GeneralSetting.CustomDownloadsDir:
        props.setCustomDownloadsDir(value);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Row className={styles.row}>
        <Col span={10}>Chapter Languages</Col>
        <Col span={14}>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Select languages..."
            defaultValue={props.chapterLanguages}
            onChange={(value) =>
              updateGeneralSetting(GeneralSetting.ChapterLanguages, value)
            }
          >
            {languageOptions}
          </Select>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Refresh Library on Startup</Col>
        <Col span={14}>
          <Switch
            checked={props.refreshOnStart}
            onChange={(checked: boolean) =>
              updateGeneralSetting(GeneralSetting.RefreshOnStart, checked)
            }
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Check For Houdoku Updates Automatically</Col>
        <Col span={14}>
          <Switch
            checked={props.autoCheckForUpdates}
            onChange={(checked: boolean) =>
              updateGeneralSetting(GeneralSetting.AutoCheckForUpdates, checked)
            }
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Check For Extension Updates Automatically</Col>
        <Col span={14}>
          <Switch
            checked={props.autoCheckForExtensionUpdates}
            onChange={(checked: boolean) =>
              updateGeneralSetting(
                GeneralSetting.AutoCheckForExtensionUpdates,
                checked
              )
            }
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Custom Downloads Location</Col>
        <Col span={14}>
          <div className={styles.downloadLocationGroup}>
            <Input
              className={styles.downloadDirInput}
              value={props.customDownloadsDir || defaultDownloadsDir}
              title={props.customDownloadsDir || defaultDownloadsDir}
              placeholder="Downloads location..."
              disabled
            />
            <Tooltip title="Select directory">
              <Button
                icon={<SelectOutlined />}
                onClick={() =>
                  ipcRenderer
                    .invoke(
                      ipcChannels.APP.SHOW_OPEN_DIALOG,
                      true,
                      [],
                      'Select Downloads Directory'
                    )
                    .then((fileList: string) => {
                      // eslint-disable-next-line promise/always-return
                      if (fileList.length > 0) {
                        updateGeneralSetting(
                          GeneralSetting.CustomDownloadsDir,
                          fileList[0]
                        );
                      }
                    })
                }
              />
            </Tooltip>
            <Tooltip title="Reset">
              <Button
                icon={<UndoOutlined />}
                onClick={() =>
                  updateGeneralSetting(GeneralSetting.CustomDownloadsDir, '')
                }
              />
            </Tooltip>
          </div>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Backup Library</Col>
        <Col span={14}>
          {/* <Input
            className={styles.downloadDirInput}
            value={props.customDownloadsDir || defaultDownloadsDir}
            title={props.customDownloadsDir || defaultDownloadsDir}
            placeholder="Downloads location..."
            disabled
          /> */}

          <div className={styles.backupButtonGroup}>
            <Button onClick={createBackup}>Create Backup</Button>
            <Button
              onClick={() =>
                ipcRenderer
                  .invoke(
                    ipcChannels.APP.SHOW_OPEN_DIALOG,
                    false,
                    [
                      {
                        name: 'Houdoku Series Backup',
                        extensions: ['json'],
                      },
                    ],
                    'Select series backup file'
                  )
                  .then((fileList: string) => {
                    // eslint-disable-next-line promise/always-return
                    if (fileList.length > 0) {
                      return ipcRenderer.invoke(
                        ipcChannels.APP.READ_ENTIRE_FILE,
                        fileList[0]
                      );
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
          </div>
        </Col>
      </Row>
    </>
  );
};

export default connector(GeneralSettings);
