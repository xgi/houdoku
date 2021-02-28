import React from 'react';
import { Select, Col, Row, Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Title from 'antd/lib/typography/Title';
import { connect, ConnectedProps } from 'react-redux';
import styles from './Settings.css';
import { Languages } from '../models/languages';
import {
  GeneralSetting,
  Language,
  LanguageKey,
  LayoutDirection,
  PageFit,
  PageView,
  ReaderSetting,
} from '../models/types';
import { RootState } from '../store';
import {
  setChapterLanguages,
  setLayoutDirection,
  setPageFit,
  setPageView,
  setPreloadAmount,
  setRefreshOnStart,
} from '../features/settings/actions';

const { Option } = Select;

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

const mapState = (state: RootState) => ({
  chapterLanguages: state.settings.chapterLanguages,
  refreshOnStart: state.settings.refreshOnStart,
  pageFit: state.settings.pageFit,
  pageView: state.settings.pageView,
  layoutDirection: state.settings.layoutDirection,
  preloadAmount: state.settings.preloadAmount,
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
        onClick={(e) => {
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
    <>
      <Title className={styles.title} level={4}>
        General
      </Title>
      <Row className={styles.row}>
        <Col span={10}>Languages in Chapter List</Col>
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
        <Col span={10}>Refresh All Series on Startup</Col>
        <Col span={14}>
          <Dropdown
            overlay={
              <Menu
                onClick={(e) => {
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
      <Title className={styles.title} level={4}>
        Reader
      </Title>
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
          <Dropdown overlay={renderMenu(ReaderSetting.PageView, pageViewText)}>
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
    </>
  );
};

export default connector(Settings);
