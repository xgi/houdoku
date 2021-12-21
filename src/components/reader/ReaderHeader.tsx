/* eslint-disable react/button-has-type */
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Typography, Dropdown, Menu } from 'antd';
import {
  FullscreenOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  FileOutlined,
  ReadOutlined,
  RightSquareOutlined,
  LeftSquareOutlined,
  DownSquareOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
  RightOutlined,
  LeftOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
  CloseOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Chapter } from 'houdoku-extension-lib';
import CheckOutlined from '@ant-design/icons/lib/icons/CheckOutlined';
import { RootState } from '../../store';
import {
  setPageNumber,
  toggleShowingSettingsModal,
} from '../../features/reader/actions';
import styles from './ReaderHeader.css';
import { ReadingDirection, PageStyle } from '../../models/types';
import {
  setReadingDirection,
  setPageStyle,
  setFitStretch,
  toggleReadingDirection,
  togglePageStyle,
  setFitContainToWidth,
  setFitContainToHeight,
} from '../../features/settings/actions';

const { Text } = Typography;

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
  series: state.reader.series,
  chapter: state.reader.chapter,
  relevantChapterList: state.reader.relevantChapterList,
  showingSettingsModal: state.reader.showingSettingsModal,
  pageStyle: state.settings.pageStyle,
  fitContainToWidth: state.settings.fitContainToWidth,
  fitContainToHeight: state.settings.fitContainToHeight,
  fitStretch: state.settings.fitStretch,
  readingDirection: state.settings.readingDirection,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setPageNumber: (pageNumber: number) => dispatch(setPageNumber(pageNumber)),
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
  toggleShowingSettingsModal: () => dispatch(toggleShowingSettingsModal()),
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
      <button
        className={`${styles.button} ${styles.fitButton}`}
        onClick={fitButtonContent.func}
      >
        {fitButtonContent.icon} {fitButtonContent.text}
      </button>
    );
  };

  useEffect(() => {
    console.log(window.innerWidth);
  }, [window.innerWidth]);

  return (
    <div className={styles.container}>
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.exitButton}`}
          onClick={props.exitPage}
        >
          <ArrowLeftOutlined /> Go Back
        </button>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.arrowButton}`}
          disabled={props.getAdjacentChapterId(true) === null}
          onClick={() => props.changeChapter(true)}
        >
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
                  {`Chapter ${chapter.chapterNumber}`}
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Text className={`${styles.field}`}>
            {props.chapter
              ? `Chapter ${props.chapter.chapterNumber}`
              : 'Unknown Chapter'}
          </Text>
        </Dropdown>
        <button
          className={`${styles.button} ${styles.arrowButton}`}
          disabled={props.getAdjacentChapterId(false) === null}
          onClick={() => props.changeChapter(false)}
        >
          <RightOutlined />
        </button>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.arrowButton}`}
          disabled={props.pageNumber <= 1}
          onClick={() => props.changePage(true, true)}
        >
          <VerticalRightOutlined />
        </button>
        <button
          className={`${styles.button} ${styles.arrowButton}`}
          disabled={
            props.pageNumber <= 1 && props.getAdjacentChapterId(true) === null
          }
          onClick={() => props.changePage(true)}
        >
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
        <button
          className={`${styles.button} ${styles.arrowButton}`}
          disabled={
            props.pageNumber === props.lastPageNumber &&
            props.getAdjacentChapterId(false) === null
          }
          onClick={() => props.changePage(false)}
        >
          <RightOutlined />
        </button>
        <button
          className={`${styles.button} ${styles.arrowButton}`}
          disabled={props.pageNumber >= props.lastPageNumber}
          onClick={() => props.changePage(false, true)}
        >
          <VerticalLeftOutlined />
        </button>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.pageStyleButton}`}
          onClick={() => props.togglePageStyle()}
        >
          {ICONS_PAGE_STYLE[props.pageStyle]} {TEXT_PAGE_STYLE[props.pageStyle]}
        </button>
      </div>

      <div className={styles.buttonGroup}>{renderFitButton()}</div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.stretchButton}`}
          onClick={() => props.setFitStretch(!props.fitStretch)}
          disabled={!(props.fitContainToHeight || props.fitContainToWidth)}
        >
          {props.fitStretch ? <CheckOutlined /> : <CloseOutlined />} Stretch to
          Fill
        </button>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.stretchButton}`}
          onClick={() => props.toggleReadingDirection()}
        >
          {ICONS_READING_DIRECTION[props.readingDirection]}{' '}
          {TEXT_READING_DIRECTION[props.readingDirection]}
        </button>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.settingsButton}`}
          onClick={() => props.toggleShowingSettingsModal()}
        >
          <SettingOutlined /> Settings
        </button>
      </div>
    </div>
  );
};

export default connector(ReaderHeader);
