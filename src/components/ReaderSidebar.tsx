/* eslint-disable react/button-has-type */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Layout, Typography, Tooltip, Dropdown, Menu } from 'antd';
import {
  FullscreenOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  PictureOutlined,
  ReadOutlined,
  ReadFilled,
  RightSquareOutlined,
  LeftSquareOutlined,
  SettingOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  RightOutlined,
  LeftOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { RootState } from '../store';
import {
  changePageNumber,
  setPageNumber,
  setPageUrls,
  setSource,
  setRelevantChapterList,
  toggleShowingSettingsModal,
  setPageDataList,
} from '../features/reader/actions';
import styles from './ReaderSidebar.css';
import {
  Chapter,
  LayoutDirection,
  PageFit,
  PageView,
  Series,
} from '../models/types';
import {
  setLayoutDirection,
  setPageFit,
  setPageView,
  setPreloadAmount,
  toggleLayoutDirection,
  togglePageFit,
  togglePageView,
} from '../features/settings/actions';
import { toggleChapterRead } from '../features/library/utils';

const { Sider } = Layout;
const { Title, Text } = Typography;

const ICONS_PAGE_FIT = {
  [PageFit.Auto]: <FullscreenOutlined />,
  [PageFit.Width]: <ColumnWidthOutlined />,
  [PageFit.Height]: <ColumnHeightOutlined />,
};

const ICONS_PAGE_VIEW = {
  [PageView.Single]: <PictureOutlined />,
  [PageView.Double]: <ReadOutlined />,
  [PageView.Double_OddStart]: <ReadFilled />,
};

const ICONS_LAYOUT_DIRECTION = {
  [LayoutDirection.LeftToRight]: <RightSquareOutlined />,
  [LayoutDirection.RightToLeft]: <LeftSquareOutlined />,
};

const mapState = (state: RootState) => ({
  pageNumber: state.reader.pageNumber,
  lastPageNumber: state.reader.lastPageNumber,
  pageUrls: state.reader.pageUrls,
  pageDataList: state.reader.pageDataList,
  series: state.reader.series,
  chapter: state.reader.chapter,
  relevantChapterList: state.reader.relevantChapterList,
  showingSettingsModal: state.reader.showingSettingsModal,
  pageFit: state.settings.pageFit,
  pageView: state.settings.pageView,
  layoutDirection: state.settings.layoutDirection,
  preloadAmount: state.settings.preloadAmount,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setPageNumber: (pageNumber: number) => dispatch(setPageNumber(pageNumber)),
  changePageNumber: (delta: number) => dispatch(changePageNumber(delta)),
  setPageFit: (pageFit: PageFit) => dispatch(setPageFit(pageFit)),
  togglePageFit: () => dispatch(togglePageFit()),
  setPageView: (pageView: PageView) => dispatch(setPageView(pageView)),
  togglePageView: () => dispatch(togglePageView()),
  setLayoutDirection: (layoutDirection: LayoutDirection) =>
    dispatch(setLayoutDirection(layoutDirection)),
  toggleLayoutDirection: () => dispatch(toggleLayoutDirection()),
  setPreloadAmount: (preloadAmount: number) =>
    dispatch(setPreloadAmount(preloadAmount)),
  setPageUrls: (pageUrls: string[]) => dispatch(setPageUrls(pageUrls)),
  setPageDataList: (pageDataList: string[]) =>
    dispatch(setPageDataList(pageDataList)),
  setSource: (series?: Series, chapter?: Chapter) =>
    dispatch(setSource(series, chapter)),
  setRelevantChapterList: (relevantChapterList: Chapter[]) =>
    dispatch(setRelevantChapterList(relevantChapterList)),
  toggleShowingSettingsModal: () => dispatch(toggleShowingSettingsModal()),
  toggleChapterRead: (chapter: Chapter, series: Series) =>
    toggleChapterRead(dispatch, chapter, series),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  changePage: (left: boolean, toBound?: boolean) => void;
  setChapter: (id: number) => void;
  changeChapter: (previous: boolean) => void;
  getAdjacentChapterId: (previous: boolean) => number;
  exitPage: () => void;
};

const ReaderSidebar: React.FC<Props> = (props: Props) => {
  const getChapterTitleDisplay = (chapter: Chapter | undefined): string => {
    if (chapter === undefined) return 'Loading chapter title...';

    if (chapter.title.length > 0) {
      return `${chapter.chapterNumber} - ${chapter.title}`;
    }
    return `Chapter ${chapter.chapterNumber}`;
  };

  return (
    <Sider className={styles.sider}>
      <div className={styles.siderHeader}>
        <button className={styles.exitButton} onClick={() => props.exitPage()}>
          <CloseOutlined />
        </button>
        <Title className={styles.seriesTitle} level={4}>
          {props.series === undefined ? 'loading...' : props.series.title}
        </Title>
      </div>
      <div className={styles.chapterHeader}>
        <Tooltip title="Previous Chapter ([)">
          <button
            className={`${styles.chapterButton}
            ${props.getAdjacentChapterId(true) === -1 ? styles.disabled : ''}`}
            onClick={() => props.changeChapter(true)}
          >
            <ArrowLeftOutlined />
          </button>
        </Tooltip>
        <Dropdown
          overlay={
            <Menu
              onClick={(e) => {
                props.setChapter(e.item.props['data-value']);
              }}
            >
              {props.relevantChapterList.map((chapter: Chapter) => (
                <Menu.Item key={chapter.id} data-value={chapter.id}>
                  {getChapterTitleDisplay(chapter)}
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Text className={`${styles.chapterName}`}>
            {getChapterTitleDisplay(props.chapter)}
          </Text>
        </Dropdown>
        <Tooltip title="Next Chapter (])">
          <button
            className={`${styles.chapterButton}
            ${props.getAdjacentChapterId(false) === -1 ? styles.disabled : ''}`}
            onClick={() => props.changeChapter(false)}
          >
            <ArrowRightOutlined />
          </button>
        </Tooltip>
      </div>
      <div className={styles.settingsBar}>
        <Tooltip title="Change page fit (f)">
          <button
            className={`${styles.settingsButton}`}
            onClick={() => props.togglePageFit()}
          >
            {ICONS_PAGE_FIT[props.pageFit]}
          </button>
        </Tooltip>
        <Tooltip title="Change two-page view (q)">
          <button
            className={`${styles.settingsButton}`}
            onClick={() => props.togglePageView()}
          >
            {ICONS_PAGE_VIEW[props.pageView]}
          </button>
        </Tooltip>
        <Tooltip title="Change reader direction (d)">
          <button
            className={`${styles.settingsButton}`}
            onClick={() => props.toggleLayoutDirection()}
          >
            {ICONS_LAYOUT_DIRECTION[props.layoutDirection]}
          </button>
        </Tooltip>
        <Tooltip title="Advanced Settings (o)">
          <button
            className={`${styles.settingsButton}`}
            onClick={() => props.toggleShowingSettingsModal()}
          >
            <SettingOutlined />
          </button>
        </Tooltip>
      </div>
      <div className={styles.pageControlBar}>
        <Tooltip title="First Page (ctrl+←)">
          <button
            className={`${styles.pageButton}`}
            onClick={() => props.changePage(true, true)}
          >
            <VerticalRightOutlined />
          </button>
        </Tooltip>
        <Tooltip title="Previous Page (←)">
          <button
            className={`${styles.pageButton}`}
            onClick={() => props.changePage(true)}
          >
            <LeftOutlined />
          </button>
        </Tooltip>
        <Dropdown
          overlay={
            <Menu
              onClick={(e) => {
                props.setPageNumber(e.item.props['data-value']);
              }}
            >
              {Array.from(
                { length: props.lastPageNumber },
                (v, k) => k + 1
              ).map((pageNumber: number) => (
                <Menu.Item key={pageNumber} data-value={pageNumber}>
                  Page {pageNumber}
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Text
            className={`${styles.pageNumber}`}
          >{`${props.pageNumber} / ${props.lastPageNumber}`}</Text>
        </Dropdown>
        <Tooltip title="Next Page (→)">
          <button
            className={`${styles.pageButton}`}
            onClick={() => props.changePage(false)}
          >
            <RightOutlined />
          </button>
        </Tooltip>
        <Tooltip title="Last Page (ctrl+→)">
          <button
            className={`${styles.pageButton}`}
            onClick={() => props.changePage(false, true)}
          >
            <VerticalLeftOutlined />
          </button>
        </Tooltip>
      </div>
      <div className={styles.groupRow}>
        <Text>Group: {props.chapter?.groupName}</Text>
      </div>
    </Sider>
  );
};

export default connector(ReaderSidebar);
