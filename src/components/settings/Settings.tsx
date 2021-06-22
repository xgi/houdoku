import React from 'react';
import { Select, Col, Row, Menu, Dropdown, Button, Tabs } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import { Language, LanguageKey, Languages } from 'houdoku-extension-lib';
import Paragraph from 'antd/lib/typography/Paragraph';
import styles from './Settings.css';
import {
  GeneralSetting,
  IntegrationSetting,
  LayoutDirection,
  PageFit,
  PageView,
  ReaderSetting,
} from '../../models/types';
import { RootState } from '../../store';
import {
  setChapterLanguages,
  setDiscordPresenceEnabled,
  setLayoutDirection,
  setOverlayPageNumber,
  setPageFit,
  setPageView,
  setPreloadAmount,
  setRefreshOnStart,
} from '../../features/settings/actions';
import TrackerSettings from './TrackerSettings';

const { Option } = Select;
const { TabPane } = Tabs;

const languageOptions = Object.values(Languages).map((language: Language) => (
  <Option key={language.key} value={language.key}>
    {language.name}
  </Option>
));

const refreshOnStartText: { [key: string]: string } = {
  true: 'Yes',
  false: 'No',
};
const layoutDirectionText: { [key in LayoutDirection]: string } = {
  [LayoutDirection.LeftToRight]: 'Left-to-Right',
  [LayoutDirection.RightToLeft]: 'Right-to-Left',
  [LayoutDirection.Vertical]: 'Vertical',
};
const pageViewText: { [key in PageView]: string } = {
  [PageView.Single]: 'Single',
  [PageView.Double]: 'Double (Even Start)',
  [PageView.Double_OddStart]: 'Double (Odd Start)',
};
const pageFitText: { [key in PageFit]: string } = {
  [PageFit.Auto]: 'Auto',
  [PageFit.Width]: 'Fit Width',
  [PageFit.Height]: 'Fit Height',
};
const preloadText: { [key: number]: string } = {
  0: 'Disabled',
  1: '1 Page',
  2: '2 Pages',
  3: '3 Pages',
  4: '4 Pages',
  5: '5 Pages',
};
const overlayPageNumberText: { [key: string]: string } = {
  true: 'Yes',
  false: 'No',
};

const mapState = (state: RootState) => ({
  chapterLanguages: state.settings.chapterLanguages,
  refreshOnStart: state.settings.refreshOnStart,
  pageFit: state.settings.pageFit,
  pageView: state.settings.pageView,
  layoutDirection: state.settings.layoutDirection,
  preloadAmount: state.settings.preloadAmount,
  overlayPageNumber: state.settings.overlayPageNumber,
  discordPresenceEnabled: state.settings.discordPresenceEnabled,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setChapterLanguages: (chapterLanguages: LanguageKey[]) =>
    dispatch(setChapterLanguages(chapterLanguages)),
  setRefreshOnStart: (refreshOnStart: boolean) =>
    dispatch(setRefreshOnStart(refreshOnStart)),
  setPageFit: (pageFit: PageFit) => dispatch(setPageFit(pageFit)),
  setPageView: (pageView: PageView) => dispatch(setPageView(pageView)),
  setLayoutDirection: (layoutDirection: LayoutDirection) =>
    dispatch(setLayoutDirection(layoutDirection)),
  setPreloadAmount: (preloadAmount: number) =>
    dispatch(setPreloadAmount(preloadAmount)),
  setOverlayPageNumber: (overlayPageNumber: boolean) =>
    dispatch(setOverlayPageNumber(overlayPageNumber)),
  setDiscordPresenceEnabled: (discordPresenceEnabled: boolean) =>
    dispatch(setDiscordPresenceEnabled(discordPresenceEnabled)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const Settings: React.FC<Props> = (props: Props) => {
  const updateGeneralSetting = (generalSetting: GeneralSetting, value: any) => {
    switch (generalSetting) {
      case GeneralSetting.ChapterLanguages:
        props.setChapterLanguages(value);
        break;
      case GeneralSetting.RefreshOnStart:
        props.setRefreshOnStart(value);
        break;
      default:
        break;
    }
  };

  const updateReaderSetting = (readerSetting: ReaderSetting, value: any) => {
    switch (readerSetting) {
      case ReaderSetting.LayoutDirection:
        props.setLayoutDirection(value);
        break;
      case ReaderSetting.PageFit:
        props.setPageFit(value);
        break;
      case ReaderSetting.PageView:
        props.setPageView(value);
        break;
      case ReaderSetting.PreloadAmount:
        props.setPreloadAmount(value);
        break;
      case ReaderSetting.OverlayPageNumber:
        props.setOverlayPageNumber(value);
        break;
      default:
        break;
    }
  };

  const updateIntegrationSetting = (
    integrationSetting: IntegrationSetting,
    value: any
  ) => {
    switch (integrationSetting) {
      case IntegrationSetting.DiscordPresenceEnabled:
        props.setDiscordPresenceEnabled(value);
        break;
      default:
        break;
    }
  };

  const renderMenuItems = (textMap: { [key: number]: string }) => {
    return (
      <>
        {Object.entries(textMap).map((entry) => {
          return (
            <Menu.Item key={entry[0]} data-value={entry[0]}>
              {entry[1]}
            </Menu.Item>
          );
        })}
      </>
    );
  };

  const renderMenu = (
    readerSetting: ReaderSetting,
    textMap: { [key: number]: string }
  ) => {
    return (
      <Menu
        onClick={(e: any) => {
          updateReaderSetting(
            readerSetting,
            parseInt(e.item.props['data-value'], 10)
          );
        }}
      >
        {renderMenuItems(textMap)}
      </Menu>
    );
  };

  return (
    <Tabs defaultActiveKey="1" tabPosition="top">
      <TabPane tab="General" key={1}>
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
                {refreshOnStartText[props.refreshOnStart.toString()]}{' '}
                <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>
      </TabPane>
      <TabPane tab="Reader" key={2}>
        <Row className={styles.row}>
          <Col span={10}>Layout Direction</Col>
          <Col span={14}>
            <Dropdown
              overlay={renderMenu(
                ReaderSetting.LayoutDirection,
                layoutDirectionText
              )}
            >
              <Button>
                {layoutDirectionText[props.layoutDirection]} <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col span={10}>Page View</Col>
          <Col span={14}>
            <Dropdown
              overlay={renderMenu(ReaderSetting.PageView, pageViewText)}
            >
              <Button>
                {pageViewText[props.pageView]} <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col span={10}>Page Fit</Col>
          <Col span={14}>
            <Dropdown overlay={renderMenu(ReaderSetting.PageFit, pageFitText)}>
              <Button>
                {pageFitText[props.pageFit]} <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col span={10}>Image Preloading</Col>
          <Col span={14}>
            <Dropdown
              overlay={renderMenu(ReaderSetting.PreloadAmount, preloadText)}
            >
              <Button>
                {preloadText[props.preloadAmount]} <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col span={10}>Overlay Page Number</Col>
          <Col span={14}>
            <Dropdown
              overlay={
                <Menu
                  onClick={(e: any) => {
                    updateReaderSetting(
                      ReaderSetting.OverlayPageNumber,
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
                {overlayPageNumberText[props.overlayPageNumber.toString()]}{' '}
                <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>
      </TabPane>
      <TabPane tab="Trackers" key={3}>
        <TrackerSettings />
      </TabPane>
      <TabPane tab="Integrations" key={4}>
        <Row className={styles.row}>
          <Col span={10}>Use Discord Rich Presence</Col>
          <Col span={14}>
            <Dropdown
              overlay={
                <Menu
                  onClick={(e: any) => {
                    updateIntegrationSetting(
                      IntegrationSetting.DiscordPresenceEnabled,
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
                {props.discordPresenceEnabled ? 'Yes' : 'No'}
                <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col span={20}>
            <Paragraph>
              To use Discord Rich Presence, make sure &quot;Display current
              activity as a status message&quot; is enabled in your Discord
              settings (under the Activity Status tab).
            </Paragraph>
          </Col>
        </Row>
      </TabPane>
    </Tabs>
  );
};

export default connector(Settings);
