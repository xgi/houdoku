/* eslint-disable react/button-has-type */
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import Mousetrap from 'mousetrap';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import {
  PageRequesterData,
  Chapter,
  Series,
  SeriesSourceType,
} from 'houdoku-extension-lib';
import Paragraph from 'antd/lib/typography/Paragraph';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { RootState } from '../../store';
import styles from './ReaderPage.css';
import routes from '../../constants/routes.json';
import { ReadingDirection, PageStyle } from '../../models/types';
import { selectMostSimilarChapter } from '../../util/comparison';
import ReaderSettingsModal from './ReaderSettingsModal';
import {
  setFitContainToHeight,
  setFitContainToWidth,
  setFitStretch,
  setPageStyle,
  setPreloadAmount,
  setReadingDirection,
  togglePageStyle,
  toggleReadingDirection,
} from '../../features/settings/actions';
import { toggleChapterRead } from '../../features/library/utils';
import { useForceUpdate } from '../../util/reactutil';
import ReaderViewer from './ReaderViewer';
import ReaderHeader from './ReaderHeader';
import ReaderLoader from './ReaderLoader';
import { sendProgressToTrackers } from '../../features/tracker/utils';
import ipcChannels from '../../constants/ipcChannels.json';
import { FS_METADATA } from '../../services/extensions/filesystem';
import {
  getChapterDownloaded,
  getChapterDownloadPath,
} from '../../util/filesystem';
import library from '../../services/library';
import { updateTitlebarText } from '../../util/titlebar';
import * as libraryStates from '../../state/libraryStates';
import * as readerStates from '../../state/readerStates';

const defaultDownloadsDir = await ipcRenderer.invoke(
  ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR
);

const mapState = (state: RootState) => ({
  customDownloadsDir: state.settings.customDownloadsDir,
  pageStyle: state.settings.pageStyle,
  fitContainToWidth: state.settings.fitContainToWidth,
  fitContainToHeight: state.settings.fitContainToHeight,
  fitStretch: state.settings.fitStretch,
  readingDirection: state.settings.readingDirection,
  preloadAmount: state.settings.preloadAmount,
  trackerAutoUpdate: state.settings.trackerAutoUpdate,
  discordPresenceEnabled: state.settings.discordPresenceEnabled,
  keyPreviousPage: state.settings.keyPreviousPage,
  keyFirstPage: state.settings.keyFirstPage,
  keyNextPage: state.settings.keyNextPage,
  keyLastPage: state.settings.keyLastPage,
  keyPreviousChapter: state.settings.keyPreviousChapter,
  keyNextChapter: state.settings.keyNextChapter,
  keyToggleReadingDirection: state.settings.keyToggleReadingDirection,
  keyTogglePageStyle: state.settings.keyTogglePageStyle,
  keyToggleShowingSettingsModal: state.settings.keyToggleShowingSettingsModal,
  keyToggleShowingSidebar: state.settings.keyToggleShowingSidebar,
  keyToggleShowingHeader: state.settings.keyToggleShowingHeader,
  keyExit: state.settings.keyExit,
  keyCloseOrBack: state.settings.keyCloseOrBack,
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
  setPreloadAmount: (preloadAmount: number) =>
    dispatch(setPreloadAmount(preloadAmount)),
  sendProgressToTrackers: (chapter: Chapter, series: Series) =>
    sendProgressToTrackers(chapter, series),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

interface ParamTypes {
  series_id: string;
  chapter_id: string;
}

const ReaderPage: React.FC<Props> = (props: Props) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { series_id, chapter_id } = useParams<ParamTypes>();
  const history = useHistory();
  const location = useLocation();
  const forceUpdate = useForceUpdate();
  const setChapterList = useSetRecoilState(libraryStates.chapterListState);
  const setLibrarySeries = useSetRecoilState(libraryStates.seriesState);
  const [readerSeries, setReaderSeries] = useRecoilState(
    readerStates.seriesState
  );
  const [readerChapter, setReaderChapter] = useRecoilState(
    readerStates.chapterState
  );

  const [pageNumber, setPageNumber] = useRecoilState(
    readerStates.pageNumberState
  );
  const [lastPageNumber, setLastPageNumber] = useRecoilState(
    readerStates.lastPageNumberState
  );
  const setPageUrls = useSetRecoilState(readerStates.pageUrlsState);
  const [pageDataList, setPageDataList] = useRecoilState(
    readerStates.pageDataListState
  );
  const [relevantChapterList, setRelevantChapterList] = useRecoilState(
    readerStates.relevantChapterListState
  );
  const [showingSettingsModal, setShowingSettingsModal] = useRecoilState(
    readerStates.showingSettingsModalState
  );
  const [showingSidebar, setShowingSidebar] = useRecoilState(
    readerStates.showingSidebarState
  );
  const [showingHeader, setShowingHeader] = useRecoilState(
    readerStates.showingHeaderState
  );
  const [showingNoNextChapter, setShowingNoNextChapter] = useRecoilState(
    readerStates.showingNoNextChapterState
  );

  /**
   * Populate the relevantChapterList prop.
   * This prop is used to identify the chapters shown in the selector dropdown (and which can be
   * accessed by pressing next/previous chapter on the UI). There is one entry for each unique
   * chapter number matching the current chapter's release language, as long as one exists. If there
   * are multiple to choose from, we try to find one with the same group.
   * See also comparison.selectMostSimilarChapter
   * @param series the series to find relevant chapters for
   * @param chapter the current chapter to find other chapters in relation to
   */
  const createRelevantChapterList = (series: Series, chapter: Chapter) => {
    if (series.id === undefined) return;

    const newRelevantChapterList: Chapter[] = [];
    const chapters: Chapter[] = library.fetchChapters(series.id);

    const chapterNumbersSet: Set<string> = new Set();
    chapters.forEach((c: Chapter) => chapterNumbersSet.add(c.chapterNumber));
    const chapterNumbers: number[] = Array.from(chapterNumbersSet)
      .map((chapterNumberStr: string) => parseFloat(chapterNumberStr))
      .sort((a, b) => a - b)
      .reverse();

    chapterNumbers.forEach((chapterNumber: number) => {
      const curChapters: Chapter[] = chapters.filter(
        (c: Chapter) => parseFloat(c.chapterNumber) === chapterNumber
      );

      const bestMatch: Chapter | null = selectMostSimilarChapter(
        chapter,
        curChapters
      );
      if (bestMatch !== null && bestMatch.id !== undefined) {
        newRelevantChapterList.push(bestMatch);
      }
    });

    setRelevantChapterList(newRelevantChapterList);
  };

  const loadDownloadedChapterData = async (
    series: Series,
    chapter: Chapter
  ) => {
    log.debug(
      `Reader is loading downloaded chapter data for chapter ${chapter.id}`
    );

    const chapterDownloadPath: string = getChapterDownloadPath(
      series,
      chapter,
      props.customDownloadsDir || defaultDownloadsDir
    );

    const newPageUrls: string[] = await ipcRenderer
      .invoke(
        ipcChannels.EXTENSION.GET_PAGE_REQUESTER_DATA,
        FS_METADATA.id,
        SeriesSourceType.STANDARD,
        '',
        chapterDownloadPath
      )
      .then((pageRequesterData: PageRequesterData) =>
        ipcRenderer.invoke(
          ipcChannels.EXTENSION.GET_PAGE_URLS,
          FS_METADATA.id,
          pageRequesterData
        )
      );
    setPageUrls(newPageUrls);
    setLastPageNumber(newPageUrls.length);

    Promise.all(
      newPageUrls.map((pageUrl) =>
        ipcRenderer.invoke(
          ipcChannels.EXTENSION.GET_PAGE_DATA,
          FS_METADATA.id,
          series,
          pageUrl
        )
      )
    )
      // eslint-disable-next-line promise/always-return
      .then((newPageDataList: string[]) => {
        setPageDataList(newPageDataList);
        forceUpdate();
      })
      .catch((e) => log.error(e));
  };

  /**
   * Populate the reader's props using the specified chapter.
   * Despite being async, you cannot guarantee that all of the props will be set when this function
   * resolves, since it does not wait for prop methods. However, it will eventually set all
   * necessary props for the reader to properly show the chapter.
   * @param chapterId the chapter to view. If it does not exist, this method returns immediately
   * @param seriesId the id of the series the chapter is from
   */
  const loadChapterData = async (chapterId: string, seriesId: string) => {
    log.debug(`Reader is loading chapter data for chapter ${chapterId}`);

    const chapter: Chapter | null = library.fetchChapter(seriesId, chapterId);
    const series: Series | null = library.fetchSeries(seriesId);
    if (chapter === null || series === null) return;

    if (relevantChapterList.length === 0) {
      createRelevantChapterList(series, chapter);
    }

    setReaderSeries(series);
    setReaderChapter(chapter);
    updateTitlebarText(
      `${series.title} - ${
        chapter.chapterNumber
          ? `Chapter ${chapter.chapterNumber}`
          : 'Unknown Chapter'
      }${chapter.title ? ` - ${chapter.title}` : ''}`
    );
    if (props.discordPresenceEnabled) {
      ipcRenderer.invoke(
        ipcChannels.INTEGRATION.DISCORD_SET_ACTIVITY,
        series,
        chapter
      );
    }

    if (
      getChapterDownloaded(
        series,
        chapter,
        props.customDownloadsDir || defaultDownloadsDir
      )
    ) {
      loadDownloadedChapterData(series, chapter);
      return;
    }

    const newPageUrls: string[] = await ipcRenderer
      .invoke(
        ipcChannels.EXTENSION.GET_PAGE_REQUESTER_DATA,
        series.extensionId,
        series.sourceType,
        series.sourceId,
        chapter.sourceId
      )
      .then((pageRequesterData: PageRequesterData) =>
        ipcRenderer.invoke(
          ipcChannels.EXTENSION.GET_PAGE_URLS,
          series.extensionId,
          pageRequesterData
        )
      );
    setPageUrls(newPageUrls);
    setLastPageNumber(newPageUrls.length);

    Promise.all(
      newPageUrls.map((pageUrl) =>
        ipcRenderer.invoke(
          ipcChannels.EXTENSION.GET_PAGE_DATA,
          FS_METADATA.id,
          series,
          pageUrl
        )
      )
    )
      // eslint-disable-next-line promise/always-return
      .then((newPageDataList: string[]) => {
        setPageDataList(newPageDataList);
        forceUpdate();
      })
      .catch((e) => log.error(e));
  };

  /**
   * Get the ID of a chapter just before or after the current one.
   * @param previous whether to get the previous chapter (instead of the next one)
   * @return the ID of the chapter, or null if none exists (or props.chapter or
   *  props.relevantChapterList have not been loaded)
   */
  const getAdjacentChapterId = (previous: boolean): string | null => {
    if (readerChapter === undefined) return null;

    const curChapterIndex: number = relevantChapterList.findIndex(
      (chapter: Chapter) => chapter.id === readerChapter?.id
    );
    const newChapterIndex = previous
      ? curChapterIndex + 1
      : curChapterIndex - 1;

    if (
      curChapterIndex === -1 ||
      newChapterIndex < 0 ||
      newChapterIndex >= relevantChapterList.length
    )
      return null;

    const id = relevantChapterList[newChapterIndex]?.id;
    return id === undefined ? null : id;
  };

  /**
   * Change to the specified chapter.
   * The chapter does not necessarily need to be included in relevantChapterList.
   * @param id the chapter id
   */
  const setChapter = (id: string) => {
    setPageNumber(1);
    setPageUrls([]);
    setLastPageNumber(0);
    setPageDataList([]);

    loadChapterData(id, series_id);
  };

  /**
   * Change to an adjacent chapter.
   * Adjacent chapter is determined using getAdjacentChapterId. If not found, this method returns
   * without doing anything.
   * @param previous whether to get the previous chapter (as opposed to the next)
   * @return whether the chapter was actually changed or not
   */
  const changeChapter = (previous: boolean) => {
    const newChapterId = getAdjacentChapterId(previous);
    if (newChapterId === null) return false;
    setChapter(newChapterId);
    return true;
  };

  const removeRootStyles = () => {
    document
      .getElementById('root')
      ?.classList.remove(styles.root, styles.headerless);
  };

  const addRootStyles = () => {
    removeRootStyles();

    const stylesToAdd = [styles.root];
    if (!showingHeader) {
      stylesToAdd.push(styles.headerless);
    }
    document.getElementById('root')?.classList.add(...stylesToAdd);
  };

  /**
   * Remove all keybindings from the window.
   */
  const removeKeybindings = () => {
    Mousetrap.unbind(
      Object.values([
        props.keyPreviousPage,
        props.keyFirstPage,
        props.keyNextPage,
        props.keyLastPage,
        props.keyPreviousChapter,
        props.keyNextChapter,
        props.keyToggleReadingDirection,
        props.keyTogglePageStyle,
        props.keyToggleShowingSettingsModal,
        props.keyToggleShowingSidebar,
        props.keyExit,
        props.keyCloseOrBack,
      ])
    );
  };

  /**
   * Exit the reader page.
   * If the series prop is loaded, go to its series detail page. Otherwise, go to the library.
   */
  const exitPage = () => {
    setReaderSeries(undefined);
    setReaderChapter(undefined);
    setPageNumber(1);
    setPageUrls([]);
    setLastPageNumber(0);
    setPageDataList([]);
    setRelevantChapterList([]);
    setShowingNoNextChapter(false);
    removeRootStyles();
    removeKeybindings();

    updateTitlebarText();

    if (props.discordPresenceEnabled) {
      ipcRenderer.invoke(ipcChannels.INTEGRATION.DISCORD_SET_ACTIVITY);
    }

    if (readerSeries !== undefined) {
      history.push(`${routes.SERIES}/${readerSeries.id}`);
    } else {
      history.push(routes.LIBRARY);
    }
  };

  /**
   * Change the current viewed page.
   * Note that even when the user is viewing in two-page mode, they still always have a single
   * page number prop.
   * This method takes the current reader direction into account.
   * @param left whether to get the page to the left (as opposed to the right)
   * @param toBound whether to get the final page in this direction (i.e. the first or last page)
   */
  const changePage = (left: boolean, toBound = false) => {
    if (toBound) {
      if (props.readingDirection === ReadingDirection.LeftToRight) {
        setPageNumber(left ? 1 : lastPageNumber);
      } else {
        setPageNumber(left ? lastPageNumber : 1);
      }
      return;
    }

    let delta = left ? -1 : 1;
    if (props.readingDirection === ReadingDirection.RightToLeft) {
      delta = -delta;
    }
    if (props.pageStyle === PageStyle.Double) {
      delta *= 2;
    }

    if (showingNoNextChapter) {
      if (delta < 0) {
        setShowingNoNextChapter(false);
      } else {
        exitPage();
      }
    } else {
      setPageNumber(pageNumber + delta);
    }
  };

  /**
   * Add all keybindings to the window.
   * These need to be removed (with removeKeybindings) when changing to another page.
   */
  const addKeybindings = () => {
    Mousetrap.bind(props.keyPreviousPage, () => changePage(true));
    Mousetrap.bind(props.keyFirstPage, () => changePage(true, true));
    Mousetrap.bind(props.keyNextPage, () => changePage(false));
    Mousetrap.bind(props.keyLastPage, () => changePage(false, true));
    Mousetrap.bind(props.keyPreviousChapter, () => changeChapter(true));
    Mousetrap.bind(props.keyNextChapter, () => changeChapter(false));
    Mousetrap.bind(props.keyToggleReadingDirection, () =>
      props.toggleReadingDirection()
    );
    Mousetrap.bind(props.keyTogglePageStyle, () => props.togglePageStyle());
    Mousetrap.bind(props.keyToggleShowingSettingsModal, () =>
      setShowingSettingsModal(!showingSettingsModal)
    );
    Mousetrap.bind(props.keyToggleShowingSidebar, () =>
      setShowingSidebar(showingSidebar)
    );
    Mousetrap.bind(props.keyToggleShowingHeader, () =>
      setShowingHeader(!showingHeader)
    );
    Mousetrap.bind(props.keyExit, exitPage);
    Mousetrap.bind(props.keyCloseOrBack, exitPage);
  };

  useEffect(() => {
    addRootStyles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showingHeader]);

  useEffect(() => {
    // mark the chapter as read if past a certain page threshold
    if (
      readerSeries !== undefined &&
      readerChapter !== undefined &&
      !readerChapter.read &&
      lastPageNumber > 0
    ) {
      if (pageNumber >= Math.floor(0.8 * lastPageNumber)) {
        toggleChapterRead(
          readerChapter,
          readerSeries,
          setChapterList,
          setLibrarySeries
        );
        setReaderChapter({ ...readerChapter, read: true });
        if (props.trackerAutoUpdate)
          props.sendProgressToTrackers(readerChapter, readerSeries);
      }
    }

    // if we go past the last page or before the first page, change the chapter
    if (pageNumber > lastPageNumber && lastPageNumber !== 0) {
      const changed = changeChapter(false);
      if (!changed) {
        setShowingNoNextChapter(true);
        setPageNumber(lastPageNumber);
      }
    } else if (pageNumber <= 0) {
      const changed = changeChapter(true);
      if (!changed) setPageNumber(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  useEffect(() => {
    removeKeybindings();
    addKeybindings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showingNoNextChapter,
    showingSettingsModal,
    props.readingDirection,
    props.pageStyle,
    readerChapter,
    pageNumber,
    lastPageNumber,
  ]);

  useEffect(() => {
    addRootStyles();
    addKeybindings();
    loadChapterData(chapter_id, series_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <div className={styles.content} tabIndex={0}>
      <ReaderSettingsModal />
      {showingHeader ? (
        <ReaderHeader
          changePage={changePage}
          setChapter={setChapter}
          changeChapter={changeChapter}
          getAdjacentChapterId={getAdjacentChapterId}
          exitPage={exitPage}
        />
      ) : (
        <></>
      )}

      {showingNoNextChapter ? (
        <div className={styles.finalChapterContainer}>
          <Paragraph>There&apos;s no next chapter.</Paragraph>
        </div>
      ) : (
        <>
          {pageDataList.length === 0 ? (
            <ReaderLoader extensionId={readerSeries?.extensionId} />
          ) : (
            <ReaderViewer changePage={changePage} />
          )}
        </>
      )}
    </div>
  );
};

export default connector(ReaderPage);
