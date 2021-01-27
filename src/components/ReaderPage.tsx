/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/button-has-type */
/* eslint-disable consistent-return */
/* eslint-disable promise/catch-or-return */
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Link, Switch, Route, useParams, useHistory } from 'react-router-dom';
import {
  Layout,
  Typography,
  Button,
  Row,
  Col,
  Slider,
  Tooltip,
  Modal,
} from 'antd';
import { RootState } from '../store';
import {
  changePageNumber,
  setPageFit,
  setPageNumber,
  setPageUrls,
  setPreloadAmount,
  toggleLayoutDirection,
  togglePageFit,
  togglePageView,
  setSource,
  setChapterIdList,
  setLayoutDirection,
  setPageView,
  toggleShowingSettingsModal,
} from '../reader/actions';
import styles from './ReaderPage.css';
import routes from '../constants/routes.json';
import {
  Chapter,
  LayoutDirection,
  PageFit,
  PageView,
  ReaderSetting,
  Series,
} from '../models/types';
import { loadChapter } from '../datastore/utils';
import { getPageRequesterData, getPageUrls } from '../services/extension';
import { PageRequesterData } from '../services/extensions/types';
import db from '../services/db';
import { selectMostSimilarChapter } from '../util/comparison';
import { getStoredReaderSettings } from '../reader/utils';
import ReaderSettingsModal from './ReaderSettingsModal';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const mapState = (state: RootState) => ({
  pageNumber: state.reader.pageNumber,
  lastPageNumber: state.reader.lastPageNumber,
  pageFit: state.reader.pageFit,
  pageView: state.reader.pageView,
  layoutDirection: state.reader.layoutDirection,
  preloadAmount: state.reader.preloadAmount,
  pageUrls: state.reader.pageUrls,
  series: state.reader.series,
  chapter: state.reader.chapter,
  chapterIdList: state.reader.chapterIdList,
  createdChapterIdList: state.reader.createdChapterIdList,
  showingSettingsModal: state.reader.showingSettingsModal,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  fetchChapter: (id: number) => loadChapter(dispatch, id),
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

  const createChapterIdList = async (series: Series, chapter: Chapter) => {
    if (series.id === undefined) return;

    const chapterIdList: number[] = [];

    const chapters: Chapter[] = await db.fetchChapters(series.id);

    const chapterNumbers: Set<string> = new Set();
    chapters.forEach((c: Chapter) => chapterNumbers.add(c.chapterNumber));

    chapterNumbers.forEach((chapterNumber: string) => {
      const curChapters: Chapter[] = chapters.filter(
        (c: Chapter) => c.chapterNumber === chapterNumber
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
    if (!props.createdChapterIdList) createChapterIdList(series, chapter);

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

  const applySavedSettings = () => {
    const settings: {
      [key in ReaderSetting]?: any;
    } = getStoredReaderSettings();

    if (ReaderSetting.LayoutDirection in settings) {
      props.setLayoutDirection(settings[ReaderSetting.LayoutDirection]);
    }
    if (ReaderSetting.PageView in settings) {
      props.setPageView(settings[ReaderSetting.PageView]);
    }
    if (ReaderSetting.PageFit in settings) {
      props.setPageFit(settings[ReaderSetting.PageFit]);
    }
    if (ReaderSetting.PreloadAmount in settings) {
      props.setPreloadAmount(settings[ReaderSetting.PreloadAmount]);
    }
  };

  useEffect(() => {
    applySavedSettings();
    props.fetchChapter(chapter_id);
    loadChapterData(chapter_id);
  }, []);

  /**
   * Exit the reader page.
   * If the series prop is loaded, go to its series detail page. Otherwise, go to the library.
   */
  const exitPage = () => {
    props.setPageNumber(1);
    props.setPageUrls([]);

    if (props.series !== undefined) {
      history.push(`${routes.SERIES}/${props.series.id}`);
    } else {
      history.push(routes.LIBRARY);
    }
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
          <button
            className={`${styles.chapterButton}
            ${getAdjacentChapterId(true) === -1 ? styles.disabled : ''}`}
            onClick={() => changeChapter(true)}
          >
            <span className="icon-arrow-left6" />
          </button>
          <Text className={styles.chapterName}>
            {props.chapter === undefined
              ? 'loading...'
              : `${props.chapter.chapterNumber} - ${props.chapter.title}`}
          </Text>
          <button
            className={`${styles.chapterButton}
            ${getAdjacentChapterId(false) === -1 ? styles.disabled : ''}`}
            onClick={() => changeChapter(false)}
          >
            <span className="icon-arrow-right6" />
          </button>
        </div>
        <div className={styles.settingsBar}>
          <Tooltip title="Change page fit">
            <button
              className={`${styles.settingsButton}`}
              onClick={() => props.togglePageFit()}
            >
              <span className={`${getPageFitIconClass()}`} />
            </button>
          </Tooltip>
          <Tooltip title="Change two-page view">
            <button
              className={`${styles.settingsButton}`}
              onClick={() => props.togglePageView()}
            >
              <span className={`${getPageViewIconClass()}`} />
            </button>
          </Tooltip>
          <Tooltip title="Change reader direction">
            <button
              className={`${styles.settingsButton}`}
              onClick={() => props.toggleLayoutDirection()}
            >
              <span className={`${getLayoutDirectionIconClass()}`} />
            </button>
          </Tooltip>
          <Tooltip title="Advanced Settings">
            <button
              className={`${styles.settingsButton}`}
              onClick={() => props.toggleShowingSettingsModal()}
            >
              <span className="icon-cog" />
            </button>
          </Tooltip>
        </div>
        <div className={styles.pageControlBar}>
          <button
            className={`${styles.pageButton}`}
            onClick={() => changePage(true, true)}
          >
            <span className="icon-first2" />
          </button>
          <button
            className={`${styles.pageButton}`}
            onClick={() => changePage(true)}
          >
            <span className="icon-arrow-left" />
          </button>
          <Text className={styles.pageNumber}>
            {`${props.pageNumber} / ${props.lastPageNumber}`}
          </Text>
          <button
            className={`${styles.pageButton}`}
            onClick={() => changePage(false)}
          >
            <span className="icon-arrow-right" />
          </button>
          <button
            className={`${styles.pageButton}`}
            onClick={() => changePage(false, true)}
          >
            <span className="icon-last2" />
          </button>
        </div>
        <p>Fit is: {props.pageFit}</p>
        <p>{chapter_id}</p>
        <Button onClick={() => props.togglePageFit()}>change fit</Button>
        <p>{`cur_page=${props.pageNumber} last_page=${props.lastPageNumber}`}</p>
        <p>{`page_view=${props.pageView}`}</p>
        <p>{`layout_dir=${props.layoutDirection}`}</p>
        <p>{`preload=${props.preloadAmount}`}</p>
        <p>{props.chapter?.groupName}</p>
        <Button onClick={() => changePage(true)}>left</Button>
        <Button onClick={() => changePage(false)}>right</Button>
        <Button onClick={() => props.toggleShowingSettingsModal()}>
          show modal
        </Button>
        <Button onClick={() => props.toggleLayoutDirection()}>
          toggle layout direction
        </Button>
        <Link to={routes.LIBRARY}>
          <Button>back to library</Button>
        </Link>
      </Sider>
      <Layout className={`site-layout ${styles.contentLayout}`}>
        {renderPreloadContainer(props.pageNumber)}
        {renderViewer()}
      </Layout>
    </Layout>
  );
};

export default connector(ReaderPage);
