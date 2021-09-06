/* eslint-disable react/button-has-type */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  Layout,
  Typography,
  Tooltip,
  Dropdown,
  Menu,
  notification,
} from 'antd';
import {
  FullscreenOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  PictureOutlined,
  ReadOutlined,
  ReadFilled,
  RightSquareOutlined,
  LeftSquareOutlined,
  DownSquareOutlined,
  SettingOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  RightOutlined,
  LeftOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
  CloseOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { Chapter, Series } from 'houdoku-extension-lib';
import { RootState } from '../../store';
import {
  changePageNumber,
  setPageNumber,
  setPageUrls,
  setSource,
  setRelevantChapterList,
  toggleShowingSettingsModal,
  setPageDataList,
  toggleShowingSidebar,
} from '../../features/reader/actions';
import styles from './ReaderSidebar.css';
import { LayoutDirection, PageFit, PageView } from '../../models/types';
import {
  setLayoutDirection,
  setPageFit,
  setPageView,
  setPreloadAmount,
  toggleLayoutDirection,
  togglePageFit,
  togglePageView,
} from '../../features/settings/actions';
import { toggleChapterRead } from '../../features/library/utils';

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
  [LayoutDirection.Vertical]: <DownSquareOutlined />,
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
  keyPreviousPage: state.settings.keyPreviousPage,
  keyFirstPage: state.settings.keyFirstPage,
  keyNextPage: state.settings.keyNextPage,
  keyLastPage: state.settings.keyLastPage,
  keyPreviousChapter: state.settings.keyPreviousChapter,
  keyNextChapter: state.settings.keyNextChapter,
  keyToggleLayoutDirection: state.settings.keyToggleLayoutDirection,
  keyTogglePageView: state.settings.keyTogglePageView,
  keyTogglePageFit: state.settings.keyTogglePageFit,
  keyToggleShowingSettingsModal: state.settings.keyToggleShowingSettingsModal,
  keyToggleShowingSidebar: state.settings.keyToggleShowingSidebar,
  keyExit: state.settings.keyExit,
  keyCloseOrBack: state.settings.keyCloseOrBack,
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
  toggleShowingSidebar: () => {
    notification.open({
      message: 'Sidebar Closed',
      description: 'Press [s] or [ESC] to re-open the sidebar',
      placement: 'bottomLeft',
    });
    dispatch(toggleShowingSidebar());
  },
  toggleChapterRead: (chapter: Chapter, series: Series) =>
    toggleChapterRead(dispatch, chapter, series),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  changePage: (left: boolean, toBound?: boolean) => void;
  setChapter: (id: string) => void;
  changeChapter: (previous: boolean) => void;
  getAdjacentChapterId: (previous: boolean) => string | null;
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
          {props.series === undefined ? 'Loading title...' : props.series.title}
        </Title>
      </div>
      <div className={styles.chapterHeader}>
        <Tooltip
          title={
            <span>
              Previous Chapter <Text keyboard>{props.keyPreviousChapter}</Text>
            </span>
          }
        >
          <button
            className={`${styles.chapterButton}
            ${
              props.getAdjacentChapterId(true) === null ? styles.disabled : ''
            }`}
            onClick={() => props.changeChapter(true)}
          >
            <ArrowLeftOutlined />
          </button>
        </Tooltip>
        <Dropdown
          overlay={
            <Menu
              onClick={(e: any) => {
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
        <Tooltip
          title={
            <span>
              Next Chapter <Text keyboard>{props.keyNextChapter}</Text>
            </span>
          }
        >
          <button
            className={`${styles.chapterButton}
            ${
              props.getAdjacentChapterId(false) === null ? styles.disabled : ''
            }`}
            onClick={() => props.changeChapter(false)}
          >
            <ArrowRightOutlined />
          </button>
        </Tooltip>
      </div>
      <div className={styles.settingsBar}>
        <Tooltip
          title={
            <span>
              Change page fit <Text keyboard>{props.keyTogglePageFit}</Text>
            </span>
          }
        >
          <button
            className={`${styles.settingsButton}`}
            onClick={() => props.togglePageFit()}
          >
            {ICONS_PAGE_FIT[props.pageFit]}
          </button>
        </Tooltip>
        <Tooltip
          title={
            <span>
              Change two-page view{' '}
              <Text keyboard>{props.keyTogglePageView}</Text>
            </span>
          }
        >
          <button
            className={`${styles.settingsButton}`}
            onClick={() => props.togglePageView()}
          >
            {ICONS_PAGE_VIEW[props.pageView]}
          </button>
        </Tooltip>
        <Tooltip
          title={
            <span>
              Change reader direction{' '}
              <Text keyboard>{props.keyToggleLayoutDirection}</Text>
            </span>
          }
        >
          <button
            className={`${styles.settingsButton}`}
            onClick={() => props.toggleLayoutDirection()}
          >
            {ICONS_LAYOUT_DIRECTION[props.layoutDirection]}
          </button>
        </Tooltip>
        <Tooltip
          title={
            <span>
              Toggle sidebar{' '}
              <Text keyboard>{props.keyToggleShowingSidebar}</Text>
            </span>
          }
        >
          <button
            className={`${styles.settingsButton}`}
            onClick={() => props.toggleShowingSidebar()}
          >
            <ProfileOutlined />
          </button>
        </Tooltip>
        <Tooltip
          title={
            <span>
              Advanced Settings{' '}
              <Text keyboard>{props.keyToggleShowingSettingsModal}</Text>
            </span>
          }
        >
          <button
            className={`${styles.settingsButton}`}
            onClick={() => props.toggleShowingSettingsModal()}
          >
            <SettingOutlined />
          </button>
        </Tooltip>
      </div>
      <div className={styles.pageControlBar}>
        <Tooltip
          title={
            <span>
              First Page <Text keyboard>{props.keyFirstPage}</Text>
            </span>
          }
        >
          <button
            className={`${styles.pageButton}`}
            onClick={() => props.changePage(true, true)}
          >
            <VerticalRightOutlined />
          </button>
        </Tooltip>
        <Tooltip
          title={
            <span>
              Previous Page <Text keyboard>{props.keyPreviousPage}</Text>
            </span>
          }
        >
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
              onClick={(e: any) => {
                props.setPageNumber(e.item.props['data-value']);
              }}
            >
              {Array.from(
                { length: props.lastPageNumber },
                (_v, k) => k + 1
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
        <Tooltip
          title={
            <span>
              Next Page <Text keyboard>{props.keyNextPage}</Text>
            </span>
          }
        >
          <button
            className={`${styles.pageButton}`}
            onClick={() => props.changePage(false)}
          >
            <RightOutlined />
          </button>
        </Tooltip>
        <Tooltip
          title={
            <span>
              Last Page <Text keyboard>{props.keyLastPage}</Text>
            </span>
          }
        >
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
