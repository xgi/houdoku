import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Mousetrap from 'mousetrap';
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
import styles from './ReaderPage.css';
import routes from '../constants/routes.json';
import {
  Chapter,
  LayoutDirection,
  PageFit,
  PageView,
  Series,
} from '../models/types';
import {
  getPageData,
  getPageRequesterData,
  getPageUrls,
} from '../services/extension';
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
import { toggleChapterRead } from '../features/library/utils';
import { useForceUpdate } from '../util/reactutil';
import ReaderSidebar from './ReaderSidebar';
import ReaderViewer from './ReaderViewer';

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

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderPage: React.FC<Props> = (props: Props) => {
  const { chapter_id } = useParams();
  const history = useHistory();
  const location = useLocation();
  const forceUpdate = useForceUpdate();

  const createRelevantChapterList = async (
    series: Series,
    chapter: Chapter
  ) => {
    if (series.id === undefined) return;

    const relevantChapterList: Chapter[] = [];

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
        relevantChapterList.push(bestMatch);
      }
    });

    props.setRelevantChapterList(relevantChapterList);
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
    if (!chapter.read) props.toggleChapterRead(chapter, series);

    createRelevantChapterList(series, chapter);

    const pageUrls: string[] = await getPageRequesterData(
      series.extensionId,
      series.sourceType,
      series.sourceId,
      chapter.sourceId
    ).then((pageRequesterData: PageRequesterData) =>
      getPageUrls(series.extensionId, pageRequesterData)
    );
    props.setPageUrls(pageUrls);

    const curPageDataList: string[] = [];
    for (let i = 0; i < pageUrls.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await getPageData(series.extensionId, series, pageUrls[i]).then(
        (data: string) => {
          curPageDataList[i] = data;
          return props.setPageDataList([...curPageDataList]);
        }
      );
      forceUpdate();
    }
  };

  const renderPreloadContainer = (pageNumber: number) => {
    if (props.series === undefined) return <></>;
    if (props.pageUrls.length === 0) return <></>;

    const images = [];

    for (
      let i = pageNumber;
      i < props.lastPageNumber && i < pageNumber + props.preloadAmount;
      i += 1
    ) {
      images.push(
        <img src={props.pageDataList[i]} alt="pagepreload" key={i} />
      );
    }

    return <div className={styles.preloadContainer}>{images}</div>;
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
   * @return the ID of the chapter, or -1 if none exists (or props.chapter or
   *  props.relevantChapterList have not been loaded)
   */
  const getAdjacentChapterId = (previous: boolean): number => {
    if (props.chapter === undefined) return -1;

    const curChapterIndex: number = props.relevantChapterList.findIndex(
      (chapter: Chapter) => chapter.id === props.chapter?.id
    );
    const newChapterIndex = previous
      ? curChapterIndex + 1
      : curChapterIndex - 1;

    if (
      curChapterIndex === -1 ||
      newChapterIndex < 0 ||
      newChapterIndex >= props.relevantChapterList.length
    )
      return -1;

    const id = props.relevantChapterList[newChapterIndex]?.id;
    return id === undefined ? -1 : id;
  };

  const setChapter = (id: number) => {
    props.setPageNumber(1);
    props.setPageUrls([]);
    props.setPageDataList([]);

    loadChapterData(id);
  };

  const changeChapter = (previous: boolean) => {
    const newChapterId = getAdjacentChapterId(previous);
    if (newChapterId === -1) return;
    setChapter(newChapterId);
  };

  const addKeybindings = () => {
    Mousetrap.bind(KEYBOARD_SHORTCUTS.previousPage, () => changePage(true));
    Mousetrap.bind(KEYBOARD_SHORTCUTS.firstPage, () => changePage(true, true));
    Mousetrap.bind(KEYBOARD_SHORTCUTS.nextPage, () => changePage(false));
    Mousetrap.bind(KEYBOARD_SHORTCUTS.lastPage, () => changePage(false, true));
    Mousetrap.bind(KEYBOARD_SHORTCUTS.previousChapter, () =>
      changeChapter(true)
    );
    Mousetrap.bind(KEYBOARD_SHORTCUTS.nextChapter, () => changeChapter(false));
    Mousetrap.bind(KEYBOARD_SHORTCUTS.toggleLayoutDirection, () =>
      props.toggleLayoutDirection()
    );
    Mousetrap.bind(KEYBOARD_SHORTCUTS.togglePageView, () =>
      props.togglePageView()
    );
    Mousetrap.bind(KEYBOARD_SHORTCUTS.togglePageFit, () =>
      props.togglePageFit()
    );
    Mousetrap.bind(KEYBOARD_SHORTCUTS.toggleShowingSettingsModal, () =>
      props.toggleShowingSettingsModal()
    );
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
    props.setPageDataList([]);
    props.setRelevantChapterList([]);
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

  addKeybindings();

  return (
    <Layout className={styles.pageLayout}>
      <ReaderSettingsModal />
      <ReaderSidebar
        changePage={changePage}
        setChapter={setChapter}
        changeChapter={changeChapter}
        getAdjacentChapterId={getAdjacentChapterId}
        exitPage={exitPage}
      />
      <Layout className={`site-layout ${styles.contentLayout}`}>
        {renderPreloadContainer(props.pageNumber)}
        <ReaderViewer />
      </Layout>
    </Layout>
  );
};

export default connector(ReaderPage);
