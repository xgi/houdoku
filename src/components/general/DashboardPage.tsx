import React, { useEffect } from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  BookOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  BuildOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import log from 'electron-log';
import SeriesDetails from '../library/SeriesDetails';
import Search from '../search/Search';
import StatusBar from './StatusBar';
import styles from './DashboardPage.css';
import routes from '../../constants/routes.json';
import { reloadSeriesList } from '../../features/library/utils';
import Settings from '../settings/Settings';
import About from '../about/About';
import Library from '../library/Library';
import Extensions from '../extensions/Extensions';
import Downloads from '../downloads/Downloads';
import {
  completedStartReloadState,
  reloadingSeriesListState,
  seriesListState,
} from '../../state/libraryStates';
import library from '../../services/library';
import { statusTextState } from '../../state/statusBarStates';
import { refreshOnStartState } from '../../state/settingStates';

const { Content, Sider } = Layout;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const DashboardPage: React.FC<Props> = (props: Props) => {
  const [seriesList, setSeriesList] = useRecoilState(seriesListState);
  const [, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const [completedStartReload, setCompletedStartReload] = useRecoilState(
    completedStartReloadState
  );
  const setStatusText = useSetRecoilState(statusTextState);
  const refreshOnStart = useRecoilValue(refreshOnStartState);

  useEffect(() => {
    if (refreshOnStart && !completedStartReload && seriesList.length > 0) {
      setReloadingSeriesList(true);
      reloadSeriesList(
        library.fetchSeriesList(),
        setSeriesList,
        setReloadingSeriesList,
        setStatusText
      )
        // eslint-disable-next-line promise/always-return
        .then(() => {
          setCompletedStartReload(true);
        })
        .catch((e) => log.error(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesList]);

  return (
    <Layout className={styles.pageLayout}>
      <Sider className={styles.sider}>
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<BookOutlined />}>
            <Link
              to={routes.LIBRARY}
              onClick={() => setSeriesList(library.fetchSeriesList())}
            >
              Library
            </Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<PlusSquareOutlined />}>
            <Link to={routes.SEARCH}>Add Series</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<SettingOutlined />}>
            <Link to={routes.SETTINGS}>Settings</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<BuildOutlined />}>
            <Link to={routes.EXTENSIONS}>Extensions</Link>
          </Menu.Item>
          <Menu.Item key="5" icon={<DownloadOutlined />}>
            <Link to={routes.DOWNLOADS}>Downloads</Link>
          </Menu.Item>
          <Menu.Item key="6" icon={<InfoCircleOutlined />}>
            <Link to={routes.ABOUT}>About</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className={`site-layout ${styles.contentLayout}`}>
        <Content className={styles.content}>
          <Switch>
            <Route path={`${routes.SERIES}/:id`} exact>
              <SeriesDetails />
            </Route>
            <Route path={routes.SETTINGS} exact>
              <Settings />
            </Route>
            <Route path={routes.ABOUT} exact>
              <About />
            </Route>
            <Route path={routes.SEARCH} exact>
              <Search />
            </Route>
            <Route path={routes.EXTENSIONS} exact>
              <Extensions />
            </Route>
            <Route path={routes.DOWNLOADS} exact>
              <Downloads />
            </Route>
            <Route path={routes.LIBRARY}>
              <Library />
            </Route>
          </Switch>
        </Content>
      </Layout>
      <StatusBar />
    </Layout>
  );
};

export default DashboardPage;
