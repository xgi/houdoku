/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/button-has-type */
/* eslint-disable consistent-return */
/* eslint-disable promise/catch-or-return */
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { Layout, Typography, Tooltip } from 'antd';
import Mousetrap from 'mousetrap';
import { RootState } from '../store';
import {
  changePageNumber,
  setPageNumber,
  setPageUrls,
  setSource,
  setChapterIdList,
  toggleShowingSettingsModal,
} from '../features/reader/actions';
import styles from './ReaderPage.css';
import routes from '../constants/routes.json';
import {
  Chapter,
  LayoutDirection,
  PageFit,
  PageView,
  Series,
} from '../models/types';
import { getPageRequesterData, getPageUrls } from '../services/extension';
import { PageRequesterData } from '../services/extensions/types';
import db from '../services/db';
import { selectMostSimilarChapter } from '../util/comparison';
import ReaderSettingsModal from './ReaderSettingsModal';
import {
  setLayoutDirection,
  setPageFit,
  setPageView,
  setPreloadAmount,
  toggleLayoutDirection,
  togglePageFit,
  togglePageView,
} from '../features/settings/actions';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const KEYBOARD_SHORTCUTS = {
  previousPage: 'left',
  firstPage: 'ctrl+left',
  nextPage: 'right',
  lastPage: 'ctrl+right',
  previousChapter: '[',
  nextChapter: ']',
  toggleLayoutDirection: 'd',
  togglePageView: 'q',
  togglePageFit: 'f',
  toggleShowingSettingsModal: 'o',
};

const mapState = (state: RootState) => ({
  pageNumber: state.reader.pageNumber,
  lastPageNumber: state.reader.lastPageNumber,
  pageUrls: state.reader.pageUrls,
  series: state.reader.series,
  chapter: state.reader.chapter,
  chapterIdList: state.reader.chapterIdList,
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
  setSource: (series?: Series, chapter?: Chapter) =>
    dispatch(setSource(series, chapter)),
  setChapterIdList: (chapterIdList: number[]) =>
    dispatch(setChapterIdList(chapterIdList)),
  toggleShowingSettingsModal: () => dispatch(toggleShowingSettingsModal()),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderPage: React.FC<Props> = (props: Props) => {
  const { chapter_id } = useParams();
  const history = useHistory();
  const location = useLocation();

  const createChapterIdList = async (series: Series, chapter: Chapter) => {
    if (series.id === undefined) return;

    const chapterIdList: number[] = [];

    const chapters: Chapter[] = await db.fetchChapters(series.id);

    const chapterNumbersSet: Set<string> = new Set();
    chapters.forEach((c: Chapter) => chapterNumbersSet.add(c.chapterNumber));
    const chapterNumbers: number[] = Array.from(chapterNumbersSet)
      .map((chapterNumberStr: string) => parseFloat(chapterNumberStr))
      .sort((a, b) => a - b)
      .reverse();

    chapterNumbers.forEach((chapterNumber: number) => {
      const curChapters: Chapter[] = chapters.filter(
        (c: Chapter) => c.chapterNumber === chapterNumber.toString()
      );

      const bestMatch: Chapter | null = selectMostSimilarChapter(
        chapter,
        curChapters
      );
      if (bestMatch !== null && bestMatch.id !== undefined) {
        chapterIdList.push(bestMatch.id);
      }
    });

    props.setChapterIdList(chapterIdList);
  };

  const loadChapterData = async (chapterId: number) => {
    const chapter: Chapter = await db
      .fetchChapter(chapterId)
      .then((response: any) => response[0]);

    if (chapter.seriesId === undefined) return;
    const series: Series = await db
      .fetchSeries(chapter.seriesId)
      .then((response: any) => response[0]);

    props.setSource(series, chapter);
    createChapterIdList(series, chapter);

    const pageUrls: string[] = await getPageRequesterData(
      series.extensionId,
      chapter.sourceId
    ).then((pageRequesterData: PageRequesterData) =>
      getPageUrls(series.extensionId, pageRequesterData)
    );
    props.setPageUrls(pageUrls);
  };

  const getPageMargin = () => {
    return `${props.pageNumber * -100 + 100}%`;
  };

  const getPageFitIconClass = () => {
    if (props.pageFit === PageFit.Auto) {
      return 'icon-enlarge2';
    }
    if (props.pageFit === PageFit.Width) {
      return 'icon-width';
    }
    return 'icon-height2';
  };

  const getPageViewIconClass = () => {
    if (props.pageView === PageView.Single) {
      return 'icon-image2';
    }
    if (props.pageView === PageView.Double) {
      return 'icon-images2';
    }
    return 'icon-images2-flipped';
  };

  const getLayoutDirectionIconClass = () => {
    if (props.layoutDirection === LayoutDirection.LeftToRight) {
      return 'icon-square-right';
    }
    return 'icon-square-left';
  };

  const getChapterTitleDisplay = (): string => {
    if (props.chapter === undefined) return 'Loading chapter title...';

    if (props.chapter.title.length > 0) {
      return `${props.chapter.chapterNumber} - ${props.chapter.title}`;
    }
    return `Chapter ${props.chapter.chapterNumber}`;
  };

  const renderPageImage = (pageNumber: number) => {
    if (props.pageUrls.length === 0) return;

    return pageNumber <= props.lastPageNumber && pageNumber > 0 ? (
      <img
        className={styles.pageImage}
        src={props.pageUrls[pageNumber - 1]}
        alt={`page${pageNumber}`}
        loading="lazy"
      />
    ) : (
      <img className={styles.pageImage} src="data:," alt="" />
    );
  };

  const renderTwoPageLayout = (pageNumber: number) => {
    const firstPageNumber =
      props.pageView === PageView.Double_OddStart ? pageNumber - 1 : pageNumber;
    return (
      <>
        <span className={styles.imageColumn}>
          {renderPageImage(
            props.layoutDirection === LayoutDirection.LeftToRight
              ? firstPageNumber
              : firstPageNumber + 1
          )}
        </span>
        <span className={styles.imageColumn}>
          {renderPageImage(
            props.layoutDirection === LayoutDirection.LeftToRight
              ? firstPageNumber + 1
              : firstPageNumber
          )}
        </span>
      </>
    );
  };

  const renderPreloadContainer = (pageNumber: number) => {
    if (props.pageUrls.length === 0) return;

    const images = [];

    for (
      let i = pageNumber;
      i < props.lastPageNumber && i < pageNumber + props.preloadAmount;
      i += 1
    ) {
      images.push(<img src={props.pageUrls[i]} alt="pagepreload" key={i} />);
    }

    return <div className={styles.preloadContainer}>{images}</div>;
  };

  const renderViewer = () => {
    const imageWrappers = [];

    for (let i = 1; i <= props.lastPageNumber; i += 1) {
      imageWrappers.push(
        <Content
          key={i}
          className={`${styles.imageWrapper}
            ${props.pageFit === PageFit.Auto ? styles.fitAuto : ''}
            ${props.pageFit === PageFit.Width ? styles.fitWidth : ''}
            ${props.pageFit === PageFit.Height ? styles.fitHeight : ''}
          `}
          style={{ marginLeft: i === 1 ? getPageMargin() : 0 }}
        >
          {props.pageView === PageView.Single
            ? renderPageImage(i)
            : renderTwoPageLayout(i)}
        </Content>
      );
    }

    return <div className={styles.viewerContainer}>{imageWrappers}</div>;
  };

  const changePage = (left: boolean, toBound = false) => {
    if (toBound) {
      if (props.layoutDirection === LayoutDirection.LeftToRight) {
        props.setPageNumber(left ? 0 : props.lastPageNumber);
      } else {
        props.setPageNumber(left ? props.lastPageNumber : 0);
      }
      return;
    }

    let delta = left ? -1 : 1;

    if (props.layoutDirection === LayoutDirection.RightToLeft) {
      delta = -delta;
    }
    if (props.pageView !== PageView.Single) {
      delta *= 2;
    }

    props.changePageNumber(delta);
  };

  /**
   * Get the ID of a chapter just before or after the current one.
   * @param previous whether to get the previous chapter (instead of the next one)
   * @return the ID of the chapter, or -1 if none exists (or props.chapter or props.chapterIdList
   *  have not been loaded)
   */
  const getAdjacentChapterId = (previous: boolean): number => {
    if (props.chapter === undefined) return -1;

    const curChapterIndex: number = props.chapterIdList.findIndex(
      (id: number) => id === props.chapter.id
    );
    const newChapterIndex = previous
      ? curChapterIndex + 1
      : curChapterIndex - 1;

    if (
      curChapterIndex === -1 ||
      newChapterIndex < 0 ||
      newChapterIndex >= props.chapterIdList.length
    )
      return -1;

    return props.chapterIdList[newChapterIndex];
  };

  const changeChapter = (previous: boolean) => {
    const newChapterId = getAdjacentChapterId(previous);
    if (newChapterId === -1) return;

    props.setPageNumber(1);
    props.setPageUrls([]);

    loadChapterData(newChapterId);
  };

  const removeKeybindings = () => {
    Mousetrap.unbind(Object.values(KEYBOARD_SHORTCUTS));
  };

  /**
   * Exit the reader page.
   * If the series prop is loaded, go to its series detail page. Otherwise, go to the library.
   */
  const exitPage = () => {
    props.setPageNumber(1);
    props.setPageUrls([]);
    props.setChapterIdList([]);
    removeKeybindings();

    if (props.series !== undefined) {
      history.push(`${routes.SERIES}/${props.series.id}`);
    } else {
      history.push(routes.LIBRARY);
    }
  };

  useEffect(() => {
    loadChapterData(chapter_id);
  }, [location]);

  Mousetrap.bind(KEYBOARD_SHORTCUTS.previousPage, () => changePage(true));
  Mousetrap.bind(KEYBOARD_SHORTCUTS.firstPage, () => changePage(true, true));
  Mousetrap.bind(KEYBOARD_SHORTCUTS.nextPage, () => changePage(false));
  Mousetrap.bind(KEYBOARD_SHORTCUTS.lastPage, () => changePage(false, true));
  Mousetrap.bind(KEYBOARD_SHORTCUTS.previousChapter, () => changeChapter(true));
  Mousetrap.bind(KEYBOARD_SHORTCUTS.nextChapter, () => changeChapter(false));
  Mousetrap.bind(KEYBOARD_SHORTCUTS.toggleLayoutDirection, () =>
    props.toggleLayoutDirection()
  );
  Mousetrap.bind(KEYBOARD_SHORTCUTS.togglePageView, () =>
    props.togglePageView()
  );
  Mousetrap.bind(KEYBOARD_SHORTCUTS.togglePageFit, () => props.togglePageFit());
  Mousetrap.bind(KEYBOARD_SHORTCUTS.toggleShowingSettingsModal, () =>
    props.toggleShowingSettingsModal()
  );

  return (
    <Layout className={styles.pageLayout}>
      <ReaderSettingsModal
        visible={props.showingSettingsModal}
        toggleVisible={props.toggleShowingSettingsModal}
        layoutDirection={props.layoutDirection}
        setLayoutDirection={props.setLayoutDirection}
        pageView={props.pageView}
        setPageView={props.setPageView}
        pageFit={props.pageFit}
        setPageFit={props.setPageFit}
        preloadAmount={props.preloadAmount}
        setPreloadAmount={props.setPreloadAmount}
      />
      <Sider className={styles.sider}>
        <div className={styles.siderHeader}>
          <button className={styles.exitButton} onClick={() => exitPage()}>
            <span className="icon-cross" />
          </button>
          <Title className={styles.seriesTitle} level={4}>
            {props.series === undefined ? 'loading...' : props.series.title}
          </Title>
        </div>
        <div className={styles.chapterHeader}>
          <Tooltip title="Previous Chapter ([)">
            <button
              className={`${styles.chapterButton}
            ${getAdjacentChapterId(true) === -1 ? styles.disabled : ''}`}
              onClick={() => changeChapter(true)}
            >
              <span className="icon-arrow-left6" />
            </button>
          </Tooltip>
          <Text className={styles.chapterName}>{getChapterTitleDisplay()}</Text>
          <Tooltip title="Next Chapter (])">
            <button
              className={`${styles.chapterButton}
            ${getAdjacentChapterId(false) === -1 ? styles.disabled : ''}`}
              onClick={() => changeChapter(false)}
            >
              <span className="icon-arrow-right6" />
            </button>
          </Tooltip>
        </div>
        <div className={styles.settingsBar}>
          <Tooltip title="Change page fit (f)">
            <button
              className={`${styles.settingsButton}`}
              onClick={() => props.togglePageFit()}
            >
              <span className={`${getPageFitIconClass()}`} />
            </button>
          </Tooltip>
          <Tooltip title="Change two-page view (q)">
            <button
              className={`${styles.settingsButton}`}
              onClick={() => props.togglePageView()}
            >
              <span className={`${getPageViewIconClass()}`} />
            </button>
          </Tooltip>
          <Tooltip title="Change reader direction (d)">
            <button
              className={`${styles.settingsButton}`}
              onClick={() => props.toggleLayoutDirection()}
            >
              <span className={`${getLayoutDirectionIconClass()}`} />
            </button>
          </Tooltip>
          <Tooltip title="Advanced Settings (o)">
            <button
              className={`${styles.settingsButton}`}
              onClick={() => props.toggleShowingSettingsModal()}
            >
              <span className="icon-cog" />
            </button>
          </Tooltip>
        </div>
        <div className={styles.pageControlBar}>
          <Tooltip title="First Page (ctrl+←)">
            <button
              className={`${styles.pageButton}`}
              onClick={() => changePage(true, true)}
            >
              <span className="icon-first2" />
            </button>
          </Tooltip>
          <Tooltip title="Previous Page (←)">
            <button
              className={`${styles.pageButton}`}
              onClick={() => changePage(true)}
            >
              <span className="icon-arrow-left" />
            </button>
          </Tooltip>
          <Text className={styles.pageNumber}>
            {`${props.pageNumber} / ${props.lastPageNumber}`}
          </Text>
          <Tooltip title="Next Page (→)">
            <button
              className={`${styles.pageButton}`}
              onClick={() => changePage(false)}
            >
              <span className="icon-arrow-right" />
            </button>
          </Tooltip>
          <Tooltip title="Last Page (ctrl+→)">
            <button
              className={`${styles.pageButton}`}
              onClick={() => changePage(false, true)}
            >
              <span className="icon-last2" />
            </button>
          </Tooltip>
        </div>
        <div className={styles.groupRow}>
          <Text>Group: {props.chapter?.groupName}</Text>
        </div>
      </Sider>
      <Layout className={`site-layout ${styles.contentLayout}`}>
        {renderPreloadContainer(props.pageNumber)}
        {renderViewer()}
      </Layout>
    </Layout>
  );
};

export default connector(ReaderPage);
