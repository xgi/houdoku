/* eslint-disable promise/catch-or-return */
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Link, Switch, Route, useParams } from 'react-router-dom';
import { Layout, Typography, Button, Row, Col } from 'antd';
import { RootState } from '../store';
import {
  changePageNumber,
  setPageFit,
  setPageNumber,
  togglePageFit,
  toggleTwoPageEvenStart,
  toggleTwoPageView,
} from '../reader/actions';
import samplePage from '../img/samplePage.png';
import styles from './ReaderPage.css';
import routes from '../constants/routes.json';
import { PageFit } from '../models/types';
import { loadChapter } from '../datastore/utils';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const mapState = (state: RootState) => ({
  pageNumber: state.reader.pageNumber,
  lastPageNumber: state.reader.lastPageNumber,
  pageFit: state.reader.pageFit,
  twoPageView: state.reader.twoPageView,
  twoPageEvenStart: state.reader.twoPageEvenStart,
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
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderPage: React.FC<Props> = (props: Props) => {
  const { chapter_id } = useParams();

  useEffect(() => {
    props.fetchChapter(chapter_id);
  }, []);

  const getFileName = (pageNumber: number): string => {
    return `${pageNumber}`.padStart(2, '0');
  };

  const renderPageImage = (pageNumber: number) => {
    return pageNumber <= props.lastPageNumber && pageNumber > 0 ? (
      <img
        className={styles.pageImage}
        src={`https://guya.moe/media/manga/Kaguya-Wants-To-Be-Confessed-To/chapters/0136_80xfd62s/3/${getFileName(
          pageNumber
        )}.png`}
        alt={`page${pageNumber}`}
      />
    ) : (
      <img className={styles.pageImage} src="data:," alt="" />
    );
  };

  const renderTwoPageLayout = (pageNumber: number) => {
    const leftPageNumber = props.twoPageEvenStart ? pageNumber - 1 : pageNumber;
    return (
      <>
        <span className={styles.imageColumn}>
          {renderPageImage(leftPageNumber)}
        </span>
        <span className={styles.imageColumn}>
          {renderPageImage(leftPageNumber + 1)}
        </span>
      </>
    );
  };

  return (
    <Layout className={styles.pageLayout}>
      <Sider className={styles.sider}>
        <Title level={4}>Kaguya-sama: Love is War</Title>
        <p>Fit is: {props.pageFit}</p>
        <p>{chapter_id}</p>
        <Button onClick={() => props.togglePageFit()}>change fit</Button>
        <p>{`cur_page=${props.pageNumber} last_page=${props.lastPageNumber}`}</p>
        <p>{`two_page=${props.twoPageView} even_start=${props.twoPageEvenStart}`}</p>
        <Button
          onClick={() => props.changePageNumber(props.twoPageView ? -2 : -1)}
        >
          prev page
        </Button>
        <Button
          onClick={() => props.changePageNumber(props.twoPageView ? 2 : 1)}
        >
          next page
        </Button>
        <Button onClick={() => props.toggleTwoPageView()}>
          toggle two page display
        </Button>
        <Button onClick={() => props.toggleTwoPageEvenStart()}>
          toggle two page even start
        </Button>
        <Link to={routes.LIBRARY}>
          <Button>back to library</Button>
        </Link>
      </Sider>
      <Layout className={`site-layout ${styles.contentLayout}`}>
        <div className={styles.preloadContainer}>
          <img
            src={`https://guya.moe/media/manga/Kaguya-Wants-To-Be-Confessed-To/chapters/0136_80xfd62s/3/${getFileName(
              props.pageNumber + 1
            )}.png`}
            alt="pagepreload"
          />
          <img
            src={`https://guya.moe/media/manga/Kaguya-Wants-To-Be-Confessed-To/chapters/0136_80xfd62s/3/${getFileName(
              props.pageNumber + 2
            )}.png`}
            alt="pagepreload"
          />
          <img
            src={`https://guya.moe/media/manga/Kaguya-Wants-To-Be-Confessed-To/chapters/0136_80xfd62s/3/${getFileName(
              props.pageNumber + 3
            )}.png`}
            alt="pagepreload"
          />
        </div>
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
