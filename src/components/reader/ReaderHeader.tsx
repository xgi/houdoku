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
  FileOutlined,
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
  StopOutlined,
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
import styles from './ReaderHeader.css';
import { ReadingDirection, PageStyle } from '../../models/types';
import {
  setReadingDirection,
  setPageStyle,
  setFitStretch,
  setPreloadAmount,
  toggleReadingDirection,
  togglePageStyle,
  setFitContainToWidth,
  setFitContainToHeight,
} from '../../features/settings/actions';
import CheckOutlined from '@ant-design/icons/lib/icons/CheckOutlined';

const { Sider } = Layout;
const { Title, Text } = Typography;

const TEXT_PAGE_STYLE = {
  [PageStyle.Single]: 'Single Page',
  [PageStyle.Double]: 'Double Page',
  [PageStyle.LongStrip]: 'Long Strip',
};

const ICONS_PAGE_STYLE = {
  [PageStyle.Single]: <FileOutlined />,
  [PageStyle.Double]: <ReadOutlined />,
  [PageStyle.LongStrip]: <DownSquareOutlined />,
};

const TEXT_READING_DIRECTION = {
  [ReadingDirection.LeftToRight]: 'Left-to-Right',
  [ReadingDirection.RightToLeft]: 'Right-to-Left',
};

const ICONS_READING_DIRECTION = {
  [ReadingDirection.LeftToRight]: <RightSquareOutlined />,
  [ReadingDirection.RightToLeft]: <LeftSquareOutlined />,
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
  pageStyle: state.settings.pageStyle,
  fitContainToWidth: state.settings.fitContainToWidth,
  fitContainToHeight: state.settings.fitContainToHeight,
  fitStretch: state.settings.fitStretch,
  readingDirection: state.settings.readingDirection,
  preloadAmount: state.settings.preloadAmount,
  keyPreviousPage: state.settings.keyPreviousPage,
  keyFirstPage: state.settings.keyFirstPage,
  keyNextPage: state.settings.keyNextPage,
  keyLastPage: state.settings.keyLastPage,
  keyScrollUp: state.settings.keyScrollUp,
  keyScrollDown: state.settings.keyScrollDown,
  keyPreviousChapter: state.settings.keyPreviousChapter,
  keyNextChapter: state.settings.keyNextChapter,
  keyToggleReadingDirection: state.settings.keyToggleReadingDirection,
  keyTogglePageStyle: state.settings.keyTogglePageStyle,
  keyToggleShowingSettingsModal: state.settings.keyToggleShowingSettingsModal,
  keyToggleShowingSidebar: state.settings.keyToggleShowingSidebar,
  keyExit: state.settings.keyExit,
  keyCloseOrBack: state.settings.keyCloseOrBack,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setPageNumber: (pageNumber: number) => dispatch(setPageNumber(pageNumber)),
  changePageNumber: (delta: number) => dispatch(changePageNumber(delta)),
  setFitContainToWidth: (value: boolean) =>
    dispatch(setFitContainToWidth(value)),
  setFitContainToHeight: (value: boolean) =>
    dispatch(setFitContainToHeight(value)),
  setFitStretch: (value: boolean) => dispatch(setFitStretch(value)),
  setPageStyle: (value: PageStyle) => dispatch(setPageStyle(value)),
  togglePageStyle: () => dispatch(togglePageStyle()),
  setReadingDirection: (value: ReadingDirection) =>
    dispatch(setReadingDirection(value)),
  toggleReadingDirection: () => dispatch(toggleReadingDirection()),
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

const ReaderHeader: React.FC<Props> = (props: Props) => {
  const getChapterTitleDisplay = (chapter: Chapter | undefined): string => {
    if (chapter === undefined) return 'Loading chapter title...';

    if (chapter.title.length > 0) {
      return `${chapter.chapterNumber} - ${chapter.title}`;
    }
    return `Chapter ${chapter.chapterNumber}`;
  };

  const getFitButtonContent = (): {
    text: string;
    icon: JSX.Element;
    func: () => void;
  } => {
    if (props.fitContainToHeight && props.fitContainToWidth) {
      return {
        text: 'Fit Both',
        icon: <FullscreenOutlined />,
        func: () => {
          props.setFitContainToHeight(false);
          props.setFitContainToWidth(false);
        },
      };
    }
    if (props.fitContainToWidth) {
      return {
        text: 'Fit Width',
        icon: <ColumnWidthOutlined />,
        func: () => {
          props.setFitContainToWidth(false);
          props.setFitContainToHeight(true);
        },
      };
    }
    if (props.fitContainToHeight) {
      return {
        text: 'Fit Height',
        icon: <ColumnHeightOutlined />,
        func: () => {
          props.setFitContainToWidth(true);
        },
      };
    }
    return {
      text: 'No Limit',
      icon: <StopOutlined />,
      func: () => {
        props.setFitContainToWidth(true);
      },
    };
  };

  const renderFitButton = () => {
    const fitButtonContent = getFitButtonContent();
    return (
      <button className={`${styles.fitButton}`} onClick={fitButtonContent.func}>
        {fitButtonContent.icon} {fitButtonContent.text}
      </button>
    );
  };

  return (
    <div
      style={{
        height: '30px',
        width: '100%',
        backgroundColor: 'var(--color-background-alt)',
        position: 'fixed',
        top: '24px',
        fontSize: '12px',
        fontFamily: '"Segoe UI", sans-serif',
        color: 'black',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'row',
        gap: '6px',
        paddingLeft: '6px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <button className={`${styles.exitButton}`}>
          <ArrowLeftOutlined /> Go Back
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <button className={`${styles.arrowButton}`}>
          <LeftOutlined />
        </button>
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
          <Text className={`${styles.field}`}>
            {getChapterTitleDisplay(props.chapter)}
          </Text>
        </Dropdown>
        <button className={`${styles.arrowButton}`}>
          <RightOutlined />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <button className={`${styles.arrowButton}`}>
          <VerticalRightOutlined />
        </button>
        <button className={`${styles.arrowButton}`}>
          <LeftOutlined />
        </button>
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
            className={`${styles.field}`}
          >{`${props.pageNumber} / ${props.lastPageNumber}`}</Text>
        </Dropdown>
        <button className={`${styles.arrowButton}`}>
          <RightOutlined />
        </button>
        <button className={`${styles.arrowButton}`}>
          <VerticalLeftOutlined />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <button
          className={`${styles.pageStyleButton}`}
          onClick={() => props.togglePageStyle()}
        >
          {ICONS_PAGE_STYLE[props.pageStyle]} {TEXT_PAGE_STYLE[props.pageStyle]}
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {renderFitButton()}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <button
          className={`${styles.stretchButton}`}
          onClick={() => props.setFitStretch(!props.fitStretch)}
          disabled={!(props.fitContainToHeight || props.fitContainToWidth)}
        >
          {props.fitStretch ? <CheckOutlined /> : <CloseOutlined />} Stretch to
          Fill
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <button
          className={`${styles.stretchButton}`}
          onClick={() => props.toggleReadingDirection()}
        >
          {ICONS_READING_DIRECTION[props.readingDirection]}{' '}
          {TEXT_READING_DIRECTION[props.readingDirection]}
        </button>
      </div>
    </div>
  );
};

export default connector(ReaderHeader);
