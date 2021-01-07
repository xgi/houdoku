/* eslint-disable consistent-return */
/* eslint-disable promise/catch-or-return */
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Link, Switch, Route, useParams } from 'react-router-dom';
import { Layout, Typography, Button, Row, Col, Slider } from 'antd';
import { RootState } from '../store';
import {
  changePageNumber,
  setPageFit,
  setPageNumber,
  setPageUrlFunction,
  setPreloadAmount,
  toggleLayoutDirection,
  togglePageFit,
  toggleTwoPageEvenStart,
  toggleTwoPageView,
} from '../reader/actions';
import styles from './ReaderPage.css';
import routes from '../constants/routes.json';
import { Chapter, LayoutDirection, PageFit } from '../models/types';
import { loadChapter } from '../datastore/utils';
import { PageUrlFunction } from '../services/extensions/interface';
import {
  getPageRequesterData,
  getPageUrlFunction,
} from '../services/extension';
import { PageRequesterData } from '../services/extensions/types';
import db from '../services/db';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const mapState = (state: RootState) => ({
  pageNumber: state.reader.pageNumber,
  lastPageNumber: state.reader.lastPageNumber,
  pageFit: state.reader.pageFit,
  twoPageView: state.reader.twoPageView,
  twoPageEvenStart: state.reader.twoPageEvenStart,
  layoutDirection: state.reader.layoutDirection,
  preloadAmount: state.reader.preloadAmount,
  pageUrlFunction: state.reader.pageUrlFunction,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  fetchChapter: (id: number) => loadChapter(dispatch, id),
  setPageNumber: (pageNumber: number) => dispatch(setPageNumber(pageNumber)),
  changePageNumber: (delta: number) => dispatch(changePageNumber(delta)),
  setPageFit: (pageFit: PageFit) => dispatch(setPageFit(pageFit)),
  togglePageFit: () => dispatch(togglePageFit()),
  toggleTwoPageView: () => dispatch(toggleTwoPageView()),
  toggleTwoPageEvenStart: () => dispatch(toggleTwoPageEvenStart()),
  toggleLayoutDirection: () => dispatch(toggleLayoutDirection()),
  setPreloadAmount: (preloadAmount: number) =>
    dispatch(setPreloadAmount(preloadAmount)),
  setPageUrlFunction: (pageUrlFunction: PageUrlFunction) =>
    dispatch(setPageUrlFunction(pageUrlFunction)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderPage: React.FC<Props> = (props: Props) => {
  const { chapter_id } = useParams();

  const thing = async () => {
    const pageUrlFunction: PageUrlFunction = await db
      .fetchChapter(chapter_id)
      .then((response: any) => response[0])
      .then((chapter: Chapter) => getPageRequesterData(chapter.source_id))
      .then((pageRequesterData: PageRequesterData) =>
        getPageUrlFunction(pageRequesterData)
      );
    props.setPageUrlFunction(pageUrlFunction);
  };

  useEffect(() => {
    props.fetchChapter(chapter_id);
    thing();
  }, []);

  const getFileName = (pageNumber: number): string => {
    return `${pageNumber}`.padStart(2, '0');
  };

  const renderPageImage = (pageNumber: number) => {
    if (props.pageUrlFunction === undefined) return;

    return pageNumber <= props.lastPageNumber && pageNumber > 0 ? (
      <img
        className={styles.pageImage}
        src={props.pageUrlFunction(pageNumber)}
        // src={`https://guya.moe/media/manga/Kaguya-Wants-To-Be-Confessed-To/chapters/0136_80xfd62s/3/${getFileName(
        //   pageNumber
        // )}.png`}
        alt={`page${pageNumber}`}
      />
    ) : (
      <img className={styles.pageImage} src="data:," alt="" />
    );
  };

  const renderTwoPageLayout = (pageNumber: number) => {
    const firstPageNumber = props.twoPageEvenStart
      ? pageNumber - 1
      : pageNumber;
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
    if (props.pageUrlFunction === undefined) return;

    const images = [];

    for (
      let i = 1;
      i + pageNumber <= props.lastPageNumber && i <= props.preloadAmount;
      i += 1
    ) {
      images.push(
        <img
          src={props.pageUrlFunction(pageNumber + 1)}
          // src={`https://guya.moe/media/manga/Kaguya-Wants-To-Be-Confessed-To/chapters/0136_80xfd62s/3/${getFileName(
          //   pageNumber + i
          // )}.png`}
          alt="pagepreload"
          key={i}
        />
      );
    }

    return <div className={styles.preloadContainer}>{images}</div>;
  };

  const changePage = (left: boolean) => {
    let delta = left ? -1 : 1;

    if (props.layoutDirection === LayoutDirection.RightToLeft) {
      delta = -delta;
    }
    if (props.twoPageView) {
      delta *= 2;
    }

    props.changePageNumber(delta);
  };

  const preloadSliderMarks: { [key: number]: string } = {
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '∞',
  };

  const preloadSliderTipFormatter = (value?: number): string => {
    if (value === undefined) {
      return '';
    }
    return preloadSliderMarks[value];
  };

  if (props.pageUrlFunction === undefined) {
    return <p>loading...</p>;
  }

  return (
    <Layout className={styles.pageLayout}>
      <Sider className={styles.sider}>
        <Title level={4}>Kaguya-sama: Love is War</Title>
        <p>Fit is: {props.pageFit}</p>
        <p>{chapter_id}</p>
        <Button onClick={() => props.togglePageFit()}>change fit</Button>
        <p>{`cur_page=${props.pageNumber} last_page=${props.lastPageNumber}`}</p>
        <p>{`two_page=${props.twoPageView} even_start=${props.twoPageEvenStart}`}</p>
        <p>{`layout_dir=${props.layoutDirection}`}</p>
        <p>{`preload=${props.preloadAmount}`}</p>
        <Slider
          min={0}
          max={10}
          marks={preloadSliderMarks}
          tipFormatter={(value?: number) => preloadSliderTipFormatter(value)}
          defaultValue={props.preloadAmount}
          onChange={(value: number) => props.setPreloadAmount(value)}
        />
        <Button onClick={() => changePage(true)}>left</Button>
        <Button onClick={() => changePage(false)}>right</Button>
        <Button onClick={() => props.toggleTwoPageView()}>
          toggle two page display
        </Button>
        <Button onClick={() => props.toggleTwoPageEvenStart()}>
          toggle two page even start
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
        <Content
          className={`${styles.viewerContainer}
              ${props.pageFit === PageFit.Auto ? styles.fitAuto : ''}
              ${props.pageFit === PageFit.Width ? styles.fitWidth : ''}
              ${props.pageFit === PageFit.Height ? styles.fitHeight : ''}
            `}
        >
          {props.twoPageView
            ? renderTwoPageLayout(props.pageNumber)
            : renderPageImage(props.pageNumber)}
        </Content>
      </Layout>
    </Layout>
  );
};

export default connector(ReaderPage);
