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
  setReloadingSeries,
} from '../library/actions';
import { setStatusText } from '../statusbar/actions';
import SeriesDetails from './SeriesDetails';
import Search from './Search';
import StatusBar from './StatusBar';
import styles from './DashboardPage.css';
import routes from '../constants/routes.json';
import db from '../services/db';
import {
  loadChapterList,
  loadSeries,
  loadSeriesList,
} from '../datastore/utils';
import * as database from '../db';
import { Series, Chapter } from '../models/types';
import { getSeries, getChapters } from '../services/extension';
import { downloadCover } from '../util/download';

const { Content, Sider } = Layout;
const { SubMenu } = Menu;

const mapState = (state: RootState) => ({
  seriesList: state.datastore.seriesList,
  fetchingSeriesList: state.datastore.fetchingSeriesList,
  fetchingSeries: state.datastore.fetchingSeries,
  fetchingChapterList: state.datastore.fetchingChapterList,
  series: state.datastore.series,
  addedSeries: state.datastore.addedSeries,
  chapterList: state.datastore.chapterList,
  columns: state.library.columns,
  reloadingSeries: state.library.reloadingSeries,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  updateSeriesList: () => dispatch(updateSeriesList()),
  changeNumColumns: (columns: number) => dispatch(changeNumColumns(columns)),
  setReloadingSeries: (reloading: boolean) =>
    dispatch(setReloadingSeries(reloading)),
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
  loadSeriesList: () => loadSeriesList(dispatch),
  loadSeries: (id: number) => loadSeries(dispatch, id),
  loadChapterList: (seriesId: number) => loadChapterList(dispatch, seriesId),
  // addSeries: (series: Series) => addSeries(dispatch, series),
  // addChapters: (chapters: Chapter[], series: Series) =>
  //   addChapters(dispatch, chapters, series),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const DashboardPage: React.FC<Props> = (props: Props) => {
  useEffect(() => {
    database
      .init()
      .then(() => {
        props.loadSeriesList();
      })
      .catch((error) => console.log(error));
  }, []);

  const importSeries = async (extensionId: number, sourceId: string) => {
    const series: Series = await getSeries(extensionId, sourceId);
    const chapters: Chapter[] = await getChapters(extensionId, sourceId);

    const addResponse = await db.addSeries(series);
    await db.addChapters(chapters, addResponse[0]);
    props.loadSeriesList();
    downloadCover(addResponse[0]);
  };

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
          <Menu.Item key="3" icon={<UserOutlined />}>
            {/* <Link to={routes.READER}>Reader</Link> */}
            <Link to={`${routes.READER}/1197`}>Reader</Link>
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
            <Route path={`${routes.SERIES}/:id`} exact>
              <SeriesDetails
                series={props.series}
                chapterList={props.chapterList}
                reloadingSeries={props.reloadingSeries}
                loadSeries={props.loadSeries}
                loadChapterList={props.loadChapterList}
                setReloadingSeries={props.setReloadingSeries}
              />
            </Route>
            <Route path={routes.SEARCH} exact>
              <Search library={null} />
            </Route>
            <Route path={routes.LIBRARY}>
              <>
                <Button onClick={() => db.deleteAllSeries()}>
                  delete all series
                </Button>
                <Button onClick={() => props.loadSeriesList()}>
                  fetch series list
                </Button>
                <Button onClick={props.updateSeriesList}>
                  update the series list
                </Button>
                <Button onClick={() => props.loadChapterList(1)}>
                  fetch chapter list
                </Button>
                <Button onClick={() => props.changeNumColumns(8)}>
                  update num columns
                </Button>
                <Button onClick={() => props.setStatusText('new status')}>
                  set status
                </Button>
                <Button onClick={() => importSeries(2, '429')}>
                  import 429
                </Button>
              </>
              <LibraryGrid
                columns={props.columns}
                seriesList={props.seriesList}
              />
            </Route>
          </Switch>
        </Content>
      </Layout>
      <StatusBar />
    </Layout>
  );
};

export default connector(DashboardPage);
