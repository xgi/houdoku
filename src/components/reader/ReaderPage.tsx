/* eslint-disable react/button-has-type */
import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Mousetrap from 'mousetrap';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { PageRequesterData, Chapter, Series } from 'houdoku-extension-lib';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Text, Button, ColorScheme } from '@mantine/core';
import styles from './ReaderPage.css';
import routes from '../../constants/routes.json';
import { ReadingDirection, PageStyle, OffsetPages } from '../../models/types';
import { selectMostSimilarChapter } from '../../util/comparison';
import ReaderSettingsModal from './ReaderSettingsModal';
import { markChapters } from '../../features/library/utils';
import ReaderViewer from './ReaderViewer';
import ReaderHeader from './ReaderHeader';
import ReaderLoader from './ReaderLoader';
import { sendProgressToTrackers } from '../../features/tracker/utils';
import ipcChannels from '../../constants/ipcChannels.json';
import { FS_METADATA } from '../../services/extensions/filesystem';
import { getChapterDownloaded, getChapterDownloadPath } from '../../util/filesystem';
import library from '../../services/library';
import { updateTitlebarText } from '../../util/titlebar';
import * as libraryStates from '../../state/libraryStates';
import * as readerStates from '../../state/readerStates';
import * as settingStates from '../../state/settingStates';
import {
  nextOffsetPages,
  nextPageStyle,
  nextReadingDirection,
} from '../../features/settings/utils';

import ToggleThemeSwitch from '../general/ToggleThemeSwitch';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
  colorScheme: ColorScheme;
  toggleColorScheme: (value?: ColorScheme) => void;
};

type ParamTypes = {
  series_id: string;
  chapter_id: string;
};

const ReaderPage: React.FC<Props> = (props: Props) => {
  const { colorScheme, toggleColorScheme } = props;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { series_id, chapter_id } = useParams<ParamTypes>();
  const navigate = useNavigate();
  const location = useLocation();
  const setChapterList = useSetRecoilState(libraryStates.chapterListState);
  const setLibrarySeries = useSetRecoilState(libraryStates.seriesState);
  const [readerSeries, setReaderSeries] = useRecoilState(readerStates.seriesState);
  const [readerChapter, setReaderChapter] = useRecoilState(readerStates.chapterState);

  const [pageNumber, setPageNumber] = useRecoilState(readerStates.pageNumberState);
  const [lastPageNumber, setLastPageNumber] = useRecoilState(readerStates.lastPageNumberState);
  const [pageUrls, setPageUrls] = useRecoilState(readerStates.pageUrlsState);
  const [pageGroupList, setPageGroupList] = useRecoilState(readerStates.pageGroupListState);
  const [relevantChapterList, setRelevantChapterList] = useRecoilState(
    readerStates.relevantChapterListState
  );
  const [languageChapterList, setLanguageChapterList] = useRecoilState(
    readerStates.languageChapterListState
  );
  const [showingSettingsModal, setShowingSettingsModal] = useRecoilState(
    readerStates.showingSettingsModalState
  );
  const [showingSidebar, setShowingSidebar] = useRecoilState(readerStates.showingSidebarState);
  const [showingHeader, setShowingHeader] = useRecoilState(readerStates.showingHeaderState);
  const [showingNoNextChapter, setShowingNoNextChapter] = useRecoilState(
    readerStates.showingNoNextChapterState
  );
  const customDownloadsDir = useRecoilValue(settingStates.customDownloadsDirState);
  const [pageStyle, setPageStyle] = useRecoilState(settingStates.pageStyleState);
  const [offsetPages, setOffsetPages] = useRecoilState(settingStates.offsetPagesState);
  const [readingDirection, setReadingDirection] = useRecoilState(
    settingStates.readingDirectionState
  );
  const trackerAutoUpdate = useRecoilValue(settingStates.trackerAutoUpdateState);
  const discordPresenceEnabled = useRecoilValue(settingStates.discordPresenceEnabledState);
  const chapterLanguages = useRecoilValue(settingStates.chapterLanguagesState);
  const keyPageLeft = useRecoilValue(settingStates.keyPageLeftState);
  const keyFirstPage = useRecoilValue(settingStates.keyFirstPageState);
  const keyPageRight = useRecoilValue(settingStates.keyPageRightState);
  const keyLastPage = useRecoilValue(settingStates.keyLastPageState);
  const keyChapterLeft = useRecoilValue(settingStates.keyChapterLeftState);
  const keyChapterRight = useRecoilValue(settingStates.keyChapterRightState);
  const keyToggleReadingDirection = useRecoilValue(settingStates.keyToggleReadingDirectionState);
  const keyTogglePageStyle = useRecoilValue(settingStates.keyTogglePageStyleState);
  const keyToggleOffsetDoubleSpreads = useRecoilValue(
    settingStates.keyToggleOffsetDoubleSpreadsState
  );
  const keyToggleShowingSettingsModal = useRecoilValue(
    settingStates.keyToggleShowingSettingsModalState
  );
  const keyToggleShowingSidebar = useRecoilValue(settingStates.keyToggleShowingSidebarState);
  const keyToggleShowingHeader = useRecoilValue(settingStates.keyToggleShowingHeaderState);
  const keyToggleFullscreen = useRecoilValue(settingStates.keyToggleFullscreenState);
  const keyExit = useRecoilValue(settingStates.keyExitState);
  const keyCloseOrBack = useRecoilValue(settingStates.keyCloseOrBackState);

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

      const bestMatch: Chapter | null = selectMostSimilarChapter(chapter, curChapters);
      if (bestMatch !== null && bestMatch.id !== undefined) {
        newRelevantChapterList.push(bestMatch);
      }
    });

    setRelevantChapterList(newRelevantChapterList);
  };

  const createLanguageChapterList = (series: Series, chapter: Chapter) => {
    if (series.id === undefined) return;

    const newLanguageChapterList: Chapter[] = [];
    const chapters: Chapter[] = library.fetchChapters(series.id);

    const chapterLangsSet: Set<string> = new Set();
    chapters.forEach((c: Chapter) => {
      if (chapter.chapterNumber === c.chapterNumber) {
        chapterLangsSet.add(c.chapterNumber);
      }
    });

    chapterLangsSet.forEach((chapterNumber: string) => {
      const curChapters: Chapter[] = chapters.filter(
        (c: Chapter) =>
          c.chapterNumber === chapterNumber &&
          (!chapterLanguages.length || chapterLanguages.includes(c.languageKey))
      );

      curChapters.forEach((c) => newLanguageChapterList.push(c));
    });

    setLanguageChapterList(
      newLanguageChapterList.sort((a, b) => {
        if (a.languageKey && b.languageKey) {
          return a.languageKey.localeCompare(b.languageKey);
        }
        return 0;
      })
    );
  };

  const loadDownloadedChapterData = async (
    series: Series,
    chapter: Chapter,
    desiredPage?: number
  ) => {
    log.debug(`Reader is loading downloaded chapter data for chapter ${chapter.id}`);

    const chapterDownloadPath: string = getChapterDownloadPath(
      series,
      chapter,
      customDownloadsDir || defaultDownloadsDir
    );

    const newPageUrls: string[] = await ipcRenderer
      .invoke(
        ipcChannels.EXTENSION.GET_PAGE_REQUESTER_DATA,
        FS_METADATA.id,
        '',
        chapterDownloadPath
      )
      .then((pageRequesterData: PageRequesterData) =>
        ipcRenderer.invoke(ipcChannels.EXTENSION.GET_PAGE_URLS, FS_METADATA.id, pageRequesterData)
      );
    setPageUrls(newPageUrls);
    setLastPageNumber(newPageUrls.length);
    if (desiredPage) setPageNumber(Math.min(newPageUrls.length, desiredPage));
  };

  /**
   * Populate the reader's props using the specified chapter.
   * Despite being async, you cannot guarantee that all of the props will be set when this function
   * resolves, since it does not wait for prop methods. However, it will eventually set all
   * necessary props for the reader to properly show the chapter.
   * @param chapterId the chapter to view. If it does not exist, this method returns immediately
   * @param seriesId the id of the series the chapter is from
   */
  const loadChapterData = async (chapterId: string, seriesId: string, desiredPage?: number) => {
    log.debug(`Reader is loading chapter data for chapter ${chapterId}`);

    const chapter: Chapter | null = library.fetchChapter(seriesId, chapterId);
    const series: Series | null = library.fetchSeries(seriesId);
    if (chapter === null || series === null) return;

    createLanguageChapterList(series, chapter);
    createRelevantChapterList(series, chapter);

    setReaderSeries(series);
    setReaderChapter(chapter);
    updateTitlebarText(
      `${series.title} - ${
        chapter.chapterNumber ? `Chapter ${chapter.chapterNumber}` : 'Unknown Chapter'
      }${chapter.title ? ` - ${chapter.title}` : ''}`
    );
    if (discordPresenceEnabled) {
      ipcRenderer.invoke(ipcChannels.INTEGRATION.DISCORD_SET_ACTIVITY, series, chapter);
    }

    if (await getChapterDownloaded(series, chapter, customDownloadsDir || defaultDownloadsDir)) {
      loadDownloadedChapterData(series, chapter, desiredPage);
      return;
    }

    const newPageUrls: string[] = await ipcRenderer
      .invoke(
        ipcChannels.EXTENSION.GET_PAGE_REQUESTER_DATA,
        series.extensionId,
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
    if (desiredPage) setPageNumber(Math.min(newPageUrls.length, desiredPage));
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
    const newChapterIndex = previous ? curChapterIndex + 1 : curChapterIndex - 1;

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
  const setChapter = (id: string, desiredPage?: number) => {
    setPageNumber(desiredPage || 1);
    setPageUrls([]);
    setLastPageNumber(0);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    loadChapterData(id, series_id!, desiredPage);
  };

  /**
   * Change to an adjacent chapter.
   * Adjacent chapter is determined using getAdjacentChapterId. If not found, this method returns
   * without doing anything.
   * @return whether the chapter was actually changed or not
   */
  const changeChapter = (
    direction: 'left' | 'right' | 'next' | 'previous',
    fromPageMovement?: boolean
  ) => {
    let previous = false;
    if (direction === 'left' || direction === 'right') {
      previous =
        (direction === 'left' && readingDirection === ReadingDirection.LeftToRight) ||
        (direction === 'right' && readingDirection === ReadingDirection.RightToLeft);
    } else {
      previous = direction === 'previous';
    }

    const newChapterId = getAdjacentChapterId(previous);
    if (newChapterId === null) return false;
    const desiredPage = fromPageMovement && previous ? Infinity : 1;
    setChapter(newChapterId, desiredPage);
    return true;
  };

  const removeRootStyles = () => {
    document.getElementById('root')?.classList.remove(styles.root, styles.headerless);
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
        keyPageLeft,
        keyFirstPage,
        keyPageRight,
        keyLastPage,
        keyChapterLeft,
        keyChapterRight,
        keyToggleReadingDirection,
        keyTogglePageStyle,
        keyToggleShowingSettingsModal,
        keyToggleShowingSidebar,
        keyExit,
        keyCloseOrBack,
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
    setRelevantChapterList([]);
    setLanguageChapterList([]);
    setShowingNoNextChapter(false);
    removeRootStyles();
    removeKeybindings();

    updateTitlebarText();

    if (discordPresenceEnabled) {
      ipcRenderer.invoke(ipcChannels.INTEGRATION.DISCORD_SET_ACTIVITY);
    }

    if (readerSeries !== undefined) {
      navigate(`${routes.SERIES}/${readerSeries.id}`);
    } else {
      navigate(routes.LIBRARY);
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
    if (lastPageNumber === 0) return;

    if (toBound) {
      if (readingDirection === ReadingDirection.LeftToRight) {
        setPageNumber(left ? 1 : lastPageNumber);
      } else {
        setPageNumber(left ? lastPageNumber : 1);
      }
      return;
    }

    let delta = left ? -1 : 1;
    if (readingDirection === ReadingDirection.RightToLeft) {
      delta = -delta;
    }

    if (pageStyle === PageStyle.Double) {
      const curGroupIndex = pageGroupList.findIndex((group) => group.includes(pageNumber));
      if (curGroupIndex + delta < 0) {
        delta = -pageNumber;
      } else if (curGroupIndex + delta >= pageGroupList.length) {
        delta = lastPageNumber - pageNumber + 1;
      } else {
        const newPageNumber = pageGroupList[curGroupIndex + delta][0];
        delta = newPageNumber - pageNumber;
      }
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

  const updatePageGroupList = () => {
    if (pageStyle === PageStyle.Double) {
      const imgTags = document.getElementsByTagName('img');
      const newPageGroupList: number[][] = [];
      let tempPageGroup: number[] = [];
      let nextForcedSpread = 1;

      if (imgTags) {
        const sortedImgTags = Object.values(imgTags).sort((a, b) => {
          const keyA = a.getAttribute('data-num');
          const keyB = b.getAttribute('data-num');
          if (keyA && keyB) {
            return parseInt(keyA, 10) - parseInt(keyB, 10);
          }
          return 0;
        });

        sortedImgTags.forEach((img) => {
          const imgKey = img.getAttribute('data-num');
          if (imgKey) {
            const pageNum = parseInt(imgKey, 10);
            const isSpread = img.width > img.height;

            const canOffset =
              offsetPages === OffsetPages.All ||
              (offsetPages === OffsetPages.First && pageNum === 1);

            if (canOffset && isSpread) {
              nextForcedSpread = pageNum + 1;
            }

            if (isSpread || (canOffset && nextForcedSpread === pageNum)) {
              if (tempPageGroup.length > 0) {
                newPageGroupList.push(tempPageGroup);
              }
              newPageGroupList.push([pageNum]);
              tempPageGroup = [];
            } else {
              tempPageGroup.push(pageNum);
              if (tempPageGroup.length === 2) {
                newPageGroupList.push(tempPageGroup);
                tempPageGroup = [];
              }
            }
          }
        });

        if (tempPageGroup.length > 0) newPageGroupList.push(tempPageGroup);

        setPageGroupList(newPageGroupList);
      }
    }
  };

  /**
   * Add all keybindings to the window.
   * These need to be removed (with removeKeybindings) when changing to another page.
   */
  const addKeybindings = () => {
    Mousetrap.bind(keyPageLeft, () => changePage(true));
    Mousetrap.bind(keyFirstPage, () => changePage(true, true));
    Mousetrap.bind(keyPageRight, () => changePage(false));
    Mousetrap.bind(keyLastPage, () => changePage(false, true));
    Mousetrap.bind(keyChapterLeft, () => changeChapter('left'));
    Mousetrap.bind(keyChapterRight, () => changeChapter('right'));
    Mousetrap.bind(keyToggleReadingDirection, () =>
      setReadingDirection(nextReadingDirection(readingDirection))
    );
    Mousetrap.bind(keyTogglePageStyle, () => setPageStyle(nextPageStyle(pageStyle)));
    Mousetrap.bind(keyToggleOffsetDoubleSpreads, () =>
      setOffsetPages(nextOffsetPages(offsetPages))
    );
    Mousetrap.bind(keyToggleShowingSettingsModal, () =>
      setShowingSettingsModal(!showingSettingsModal)
    );
    Mousetrap.bind(keyToggleShowingSidebar, () => setShowingSidebar(showingSidebar));
    Mousetrap.bind(keyToggleShowingHeader, () => setShowingHeader(!showingHeader));
    Mousetrap.bind(keyToggleFullscreen, () =>
      ipcRenderer.invoke(ipcChannels.WINDOW.TOGGLE_FULLSCREEN)
    );
    Mousetrap.bind(keyExit, exitPage);
    Mousetrap.bind(keyCloseOrBack, exitPage);
  };

  useEffect(() => {
    addRootStyles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showingHeader]);

  useEffect(() => {
    updatePageGroupList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offsetPages]);

  useEffect(() => {
    // mark the chapter as read if past a certain page threshold
    if (
      readerSeries !== undefined &&
      readerChapter !== undefined &&
      languageChapterList.every(chapter => readerChapter.chapterNumber === chapter.chapterNumber) &&
      !readerChapter.read &&
      lastPageNumber > 0
    ) {
      if (pageNumber >= Math.floor(0.8 * lastPageNumber)) {
        markChapters(
          [readerChapter, ...languageChapterList],
          readerSeries,
          true,
          setChapterList,
          setLibrarySeries,
          chapterLanguages
        );
        setReaderChapter({ ...readerChapter, read: true });
        if (trackerAutoUpdate) sendProgressToTrackers(readerChapter, readerSeries);
      }
    }

    // if we go past the last page or before the first page, change the chapter
    if (pageNumber > lastPageNumber && lastPageNumber !== 0) {
      const changed = changeChapter('next', true);
      if (!changed) {
        setShowingNoNextChapter(true);
        setPageNumber(lastPageNumber);
      }
    } else if (pageNumber <= 0) {
      changeChapter('previous', true);
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
    showingHeader,
    readingDirection,
    pageStyle,
    readerChapter,
    pageNumber,
    lastPageNumber,
    pageGroupList,
    offsetPages,
  ]);

  useEffect(() => {
    addRootStyles();
    addKeybindings();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    loadChapterData(chapter_id!, series_id!);
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
          colorScheme={colorScheme}
        />
      ) : (
        <></>
      )}

      {showingNoNextChapter ? (
        <div className={styles.finalChapterContainer}>
          <Text>There&apos;s no next chapter.</Text>
        </div>
      ) : (
        <>
          {pageUrls.length === 0 ? (
            <ReaderLoader extensionId={readerSeries?.extensionId} />
          ) : (
            <ReaderViewer changePage={changePage} updatePageGroupList={updatePageGroupList} />
          )}
        </>
      )}
      <ToggleThemeSwitch colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}/>
    </div>
  );
};

export default ReaderPage;
