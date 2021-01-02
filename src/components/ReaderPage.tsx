/* eslint-disable promise/catch-or-return */
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Link, Switch, Route, useParams } from 'react-router-dom';
import { Layout, Typography, Button } from 'antd';
import { RootState } from '../store';
import { setPageFit, togglePageFit } from '../reader/actions';
import samplePage from '../img/samplePage.png';
import styles from './ReaderPage.css';
import routes from '../constants/routes.json';
import { PageFit } from '../models/types';
import { loadChapter } from '../datastore/utils';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const mapState = (state: RootState) => ({
  chapter: state.reader.chapter,
  pageFit: state.reader.pageFit,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  fetchChapter: (id: number) => loadChapter(dispatch, id),
  setPageFit: (pageFit: PageFit) => dispatch(setPageFit(pageFit)),
  togglePageFit: () => dispatch(togglePageFit()),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderPage: React.FC<Props> = (props: Props) => {
  const { chapter_id } = useParams();

  useEffect(() => {
    console.log('aksjdaklsjd');
    props.fetchChapter(chapter_id);
  }, []);

  return (
    <Layout className={styles.pageLayout}>
      <Sider className={styles.sider}>
        <Title level={4}>Kaguya-sama: Love is War</Title>
        <p>Fit is: {props.pageFit}</p>
        <p>{chapter_id}</p>
        <p>{props.chapter}</p>
        <Button onClick={() => props.togglePageFit()}>change fit</Button>
        <Link to={routes.LIBRARY}>
          <Button>back to library</Button>
        </Link>
      </Sider>
      <Layout className={`site-layout ${styles.contentLayout}`}>
        <Content
          className={`
              ${props.pageFit === PageFit.Width ? styles.fitWidth : ''}
              ${props.pageFit === PageFit.Height ? styles.fitHeight : ''}
            `}
        >
          <img className={styles.pageImage} src={samplePage} alt="page" />
        </Content>
      </Layout>
    </Layout>
  );
};

export default connector(ReaderPage);
