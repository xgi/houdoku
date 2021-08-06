import React from 'react';
import { Select, Col, Row, Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import { Language, LanguageKey, Languages } from 'houdoku-extension-lib';
import styles from './GeneralSettings.css';
import { GeneralSetting } from '../../models/types';
import { RootState } from '../../store';
import {
  setAutoCheckForExtensionUpdates,
  setAutoCheckForUpdates,
  setChapterLanguages,
  setRefreshOnStart,
} from '../../features/settings/actions';

const { Option } = Select;

const languageOptions = Object.values(Languages).map((language: Language) => (
  <Option key={language.key} value={language.key}>
    {language.name}
  </Option>
));

const mapState = (state: RootState) => ({
  chapterLanguages: state.settings.chapterLanguages,
  refreshOnStart: state.settings.refreshOnStart,
  autoCheckForUpdates: state.settings.autoCheckForUpdates,
  autoCheckForExtensionUpdates: state.settings.autoCheckForExtensionUpdates,
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
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const GeneralSettings: React.FC<Props> = (props: Props) => {
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
          <Dropdown
            overlay={
              <Menu
                onClick={(e: any) => {
                  updateGeneralSetting(
                    GeneralSetting.RefreshOnStart,
                    e.item.props['data-value'] === 'true'
                  );
                }}
              >
                <Menu.Item key={1} data-value="true">
                  Yes
                </Menu.Item>
                <Menu.Item key={2} data-value="false">
                  No
                </Menu.Item>
              </Menu>
            }
          >
            <Button>
              {props.refreshOnStart ? 'Yes' : 'No'}
              <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Check For Client Updates Automatically</Col>
        <Col span={14}>
          <Dropdown
            overlay={
              <Menu
                onClick={(e: any) => {
                  updateGeneralSetting(
                    GeneralSetting.AutoCheckForUpdates,
                    e.item.props['data-value'] === 'true'
                  );
                }}
              >
                <Menu.Item key={1} data-value="true">
                  Yes
                </Menu.Item>
                <Menu.Item key={2} data-value="false">
                  No
                </Menu.Item>
              </Menu>
            }
          >
            <Button>
              {props.autoCheckForUpdates ? 'Yes' : 'No'}
              <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Check For Extension Updates Automatically</Col>
        <Col span={14}>
          <Dropdown
            overlay={
              <Menu
                onClick={(e: any) => {
                  updateGeneralSetting(
                    GeneralSetting.AutoCheckForExtensionUpdates,
                    e.item.props['data-value'] === 'true'
                  );
                }}
              >
                <Menu.Item key={1} data-value="true">
                  Yes
                </Menu.Item>
                <Menu.Item key={2} data-value="false">
                  No
                </Menu.Item>
              </Menu>
            }
          >
            <Button>
              {props.autoCheckForExtensionUpdates ? 'Yes' : 'No'}
              <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
    </>
  );
};

export default connector(GeneralSettings);
