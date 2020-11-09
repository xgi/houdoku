import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Link, Switch, Route } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { RootState } from '../store';
import LibraryGrid from './LibraryGrid';
import {
  updateSeriesList,
  changeNumColumns,
  saveLibrary,
  readLibrary,
  deleteLibrary,
  setChapterRead,
} from '../library/actions';
import { setStatusText } from '../statusbar/actions';
import SeriesDetails from './SeriesDetails';
import Search from './Search';
import StatusBar from './StatusBar';
import styles from './DashboardPage.css';
import routes from '../constants/routes.json';
import Chapter from '../models/chapter';
import db from '../services/db';
import {
  beforeLoadSeries,
  beforeLoadSeriesList,
  afterLoadSeries,
  afterLoadSeriesList,
  beforeLoadChapterList,
  afterLoadChapterList,
} from '../datastore/actions';
import * as database from '../db';

const { Content, Sider } = Layout;
const { SubMenu } = Menu;

const mapState = (state: RootState) => ({
  seriesList: state.datastore.seriesList,
  fetchingSeriesList: state.datastore.fetchingSeriesList,
  fetchingSeries: state.datastore.fetchingSeries,
  fetchingChapterList: state.datastore.fetchingChapterList,
  series: state.datastore.series,
  chapterList: state.datastore.chapterList,
  columns: state.library.columns,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  updateSeriesList: () => dispatch(updateSeriesList()),
  changeNumColumns: (columns: number) => dispatch(changeNumColumns(columns)),
  saveLibrary: () => dispatch(saveLibrary()),
  readLibrary: () => dispatch(readLibrary()),
  deleteLibrary: () => dispatch(deleteLibrary()),
  setChapterRead: (chapter: Chapter, read: boolean) =>
    dispatch(setChapterRead(chapter, read)),
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
  fetchSeriesList: () => {
    dispatch(beforeLoadSeriesList());
    // eslint-disable-next-line promise/catch-or-return
    db.fetchSerieses().then((response) =>
      dispatch(afterLoadSeriesList(response))
    );
  },
  fetchSeries: (id: number) => {
    dispatch(beforeLoadSeries());
    // eslint-disable-next-line promise/catch-or-return
    db.fetchSeries(id).then((response) =>
      dispatch(afterLoadSeries(response[0]))
    );
  },
  fetchChapterList: (seriesId: number) => {
    dispatch(beforeLoadChapterList());
    // eslint-disable-next-line promise/catch-or-return
    db.fetchChapters(seriesId).then((response) =>
      dispatch(afterLoadChapterList(response))
    );
  },
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const DashboardPage: React.FC<Props> = (props: Props) => {
  useEffect(() => {
    database.init().then(() => {
      props.fetchSeriesList();
    });
  }, []);

  return (
    <Layout className={styles.pageLayout}>
      <Sider className={styles.sider}>
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            <Link to={routes.LIBRARY}>Library</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<DesktopOutlined />}>
            <Link to={routes.SEARCH}>Search</Link>
          </Menu.Item>
          <SubMenu key="sub1" icon={<UserOutlined />} title="User">
            <Menu.Item key="3">Tom</Menu.Item>
            <Menu.Item key="4">Bill</Menu.Item>
            <Menu.Item key="5">Alex</Menu.Item>
          </SubMenu>
          <SubMenu key="sub2" icon={<TeamOutlined />} title="Team">
            <Menu.Item key="6">Team 1</Menu.Item>
            <Menu.Item key="8">Team 2</Menu.Item>
          </SubMenu>
          <Menu.Item key="9" icon={<FileOutlined />} />
        </Menu>
      </Sider>
      <Layout className={`site-layout ${styles.contentLayout}`}>
        <Content className={styles.content}>
          <Switch>
            <Route path="/" exact>
              <>
                <Button onClick={() => db.addSeries()}>add series</Button>
                <Button onClick={() => db.deleteAllSeries()}>
                  delete all series
                </Button>
                <Button onClick={() => props.fetchSeriesList()}>
                  fetch series list
                </Button>
                <Button onClick={() => db.addChapters(6)}>add chapters</Button>
                <Button onClick={props.updateSeriesList}>
                  update the series list
                </Button>
                <Button onClick={() => props.fetchChapterList(1)}>
                  fetch chapter list
                </Button>
                <Button onClick={() => props.changeNumColumns(8)}>
                  update num columns
                </Button>
                <Button onClick={() => props.saveLibrary()}>
                  save library
                </Button>
                <Button onClick={() => props.readLibrary()}>
                  read library
                </Button>
                <Button onClick={() => props.deleteLibrary()}>
                  delete library
                </Button>
                <Button onClick={() => props.setStatusText('new status')}>
                  set status
                </Button>
              </>
              <LibraryGrid
                columns={props.columns}
                seriesList={props.seriesList}
              />
            </Route>
            <Route path="/series/:id" exact>
              <SeriesDetails
                series={props.series}
                chapterList={props.chapterList}
                fetchSeries={props.fetchSeries}
                fetchChapterList={props.fetchChapterList}
              />
            </Route>
            <Route path="/search" exact>
              <Search library={props.library} />
            </Route>
          </Switch>
        </Content>
      </Layout>
      <StatusBar />
    </Layout>
  );
};

export default connector(DashboardPage);
