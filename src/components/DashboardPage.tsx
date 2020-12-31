/* eslint-disable promise/catch-or-return */
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
  addSeries,
  loadChapterList,
  loadSeries,
  loadSeriesList,
} from '../datastore/utils';
import * as database from '../db';
import { Series } from '../models/types';
import { getSeries } from '../extension/utils';

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
  extensionSeries: state.extension.series,
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
  fetchSeriesList: () => loadSeriesList(dispatch),
  fetchSeries: (id: number) => loadSeries(dispatch, id),
  fetchChapterList: (seriesId: number) => loadChapterList(dispatch, seriesId),
  getSeries: (id: string) => getSeries(dispatch, id),
  addSeries: (series: Series) => addSeries(dispatch, series),
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
                <Button onClick={() => props.getSeries('429')}>
                  get mangadex series
                </Button>
                <Button
                  onClick={() => {
                    if (props.extensionSeries !== undefined)
                      props.addSeries(props.extensionSeries);
                  }}
                >
                  add extension series
                </Button>
                <Button onClick={() => console.log(props.extensionSeries)}>
                  log extension series
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
