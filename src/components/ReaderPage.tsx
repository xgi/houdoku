/* eslint-disable promise/catch-or-return */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Link, Switch, Route } from 'react-router-dom';
import { Layout, Typography, Button } from 'antd';
import { RootState } from '../store';
import { setPageFit, togglePageFit } from '../reader/actions';
import samplePage from '../img/samplePage.png';
import styles from './ReaderPage.css';
import routes from '../constants/routes.json';
import { PageFit } from '../models/types';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const mapState = (state: RootState) => ({
  pageFit: state.reader.pageFit,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setPageFit: (pageFit: PageFit) => dispatch(setPageFit(pageFit)),
  togglePageFit: () => dispatch(togglePageFit()),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderPage: React.FC<Props> = (props: Props) => {
  return (
    <Layout className={styles.pageLayout}>
      <Sider className={styles.sider}>
        <Title level={4}>Kaguya-sama: Love is War</Title>
        <p>Fit is: {props.pageFit}</p>
        <Button onClick={() => props.togglePageFit()}>change fit</Button>
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
