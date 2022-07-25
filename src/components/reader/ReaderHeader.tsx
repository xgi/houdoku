/* eslint-disable react/button-has-type */
import React from 'react';
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
import { useRecoilState, useRecoilValue } from 'recoil';
import { RootState } from '../../store';
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
import {
  chapterState,
  lastPageNumberState,
  pageNumberState,
  relevantChapterListState,
  showingSettingsModalState,
} from '../../state/readerStates';

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
  pageStyle: state.settings.pageStyle,
  fitContainToWidth: state.settings.fitContainToWidth,
  fitContainToHeight: state.settings.fitContainToHeight,
  fitStretch: state.settings.fitStretch,
  readingDirection: state.settings.readingDirection,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
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
  const [pageNumber, setPageNumber] = useRecoilState(pageNumberState);
  const [showingSettingsModal, setShowingSettingsModal] = useRecoilState(
    showingSettingsModalState
  );
  const lastPageNumber = useRecoilValue(lastPageNumberState);
  const chapter = useRecoilValue(chapterState);
  const relevantChapterList = useRecoilValue(relevantChapterListState);

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
          disabled={
            (props.readingDirection === ReadingDirection.LeftToRight &&
              props.getAdjacentChapterId(true) === null) ||
            (props.readingDirection === ReadingDirection.RightToLeft &&
              props.getAdjacentChapterId(false) === null)
          }
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
              {relevantChapterList.map((relevantChapter: Chapter) => (
                <Menu.Item
                  key={relevantChapter.id}
                  data-value={relevantChapter.id}
                >
                  {`Chapter ${relevantChapter.chapterNumber}`}
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Text className={`${styles.field}`}>
            {chapter && chapter.chapterNumber
              ? `Chapter ${chapter.chapterNumber}`
              : 'Unknown Chapter'}
          </Text>
        </Dropdown>
        <button
          className={`${styles.button} ${styles.arrowButton}`}
          disabled={
            (props.readingDirection === ReadingDirection.LeftToRight &&
              props.getAdjacentChapterId(false) === null) ||
            (props.readingDirection === ReadingDirection.RightToLeft &&
              props.getAdjacentChapterId(true) === null)
          }
          onClick={() => props.changeChapter(false)}
        >
          <RightOutlined />
        </button>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.arrowButton}`}
          disabled={
            (props.readingDirection === ReadingDirection.LeftToRight &&
              pageNumber <= 1) ||
            (props.readingDirection === ReadingDirection.RightToLeft &&
              pageNumber >= lastPageNumber)
          }
          onClick={() => props.changePage(true, true)}
        >
          <VerticalRightOutlined />
        </button>
        <button
          className={`${styles.button} ${styles.arrowButton}`}
          disabled={
            (props.readingDirection === ReadingDirection.RightToLeft &&
              pageNumber === lastPageNumber &&
              props.getAdjacentChapterId(false) === null) ||
            (props.readingDirection === ReadingDirection.LeftToRight &&
              pageNumber <= 1 &&
              props.getAdjacentChapterId(true) === null)
          }
          onClick={() => props.changePage(true)}
        >
          <LeftOutlined />
        </button>
        <Dropdown
          overlay={
            <Menu
              onClick={(e: any) => {
                setPageNumber(e.item.props['data-value']);
              }}
            >
              {Array.from({ length: lastPageNumber }, (_v, k) => k + 1).map(
                (i: number) => (
                  <Menu.Item key={i} data-value={i}>
                    Page {i}
                  </Menu.Item>
                )
              )}
            </Menu>
          }
        >
          <Text className={`${styles.field}`}>{`${pageNumber}${
            props.pageStyle === PageStyle.Double &&
            pageNumber !== lastPageNumber
              ? `-${pageNumber + 1}`
              : ''
          } / ${lastPageNumber}`}</Text>
        </Dropdown>
        <button
          className={`${styles.button} ${styles.arrowButton}`}
          disabled={
            (props.readingDirection === ReadingDirection.LeftToRight &&
              pageNumber === lastPageNumber &&
              props.getAdjacentChapterId(false) === null) ||
            (props.readingDirection === ReadingDirection.RightToLeft &&
              pageNumber <= 1 &&
              props.getAdjacentChapterId(true) === null)
          }
          onClick={() => props.changePage(false)}
        >
          <RightOutlined />
        </button>
        <button
          className={`${styles.button} ${styles.arrowButton}`}
          disabled={
            (props.readingDirection === ReadingDirection.LeftToRight &&
              pageNumber >= lastPageNumber) ||
            (props.readingDirection === ReadingDirection.RightToLeft &&
              pageNumber <= 1)
          }
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
          onClick={() => setShowingSettingsModal(!showingSettingsModal)}
        >
          <SettingOutlined /> Settings
        </button>
      </div>
    </div>
  );
};

export default connector(ReaderHeader);
