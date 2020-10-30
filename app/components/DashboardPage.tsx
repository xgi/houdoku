import React from 'react';
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
// import { Link } from 'react-router-dom';
// import routes from '../constants/routes.json';
import { RootState } from '../store';
// import blankCover from '../img/blank_cover.png';
import LibraryGrid from './LibraryGrid';
import {
  updateSeriesList,
  changeNumColumns,
  saveLibrary,
  readLibrary,
  deleteLibrary,
  showHideSeriesDetails,
} from '../library/actions';
import { setStatusText } from '../statusbar/actions';
import Series from '../models/series';
import SeriesDetails from './SeriesDetails';
import Search from './Search';
import StatusBar from './StatusBar';
import styles from './DashboardPage.css';
import routes from '../constants/routes.json';

const { Content, Sider } = Layout;
const { SubMenu } = Menu;

const mapState = (state: RootState) => ({
  library: state.library.library,
  columns: state.library.columns,
  showingSeries: state.library.showingSeries,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  updateSeriesList: () => dispatch(updateSeriesList()),
  changeNumColumns: (columns: number) => dispatch(changeNumColumns(columns)),
  saveLibrary: () => dispatch(saveLibrary()),
  readLibrary: () => dispatch(readLibrary()),
  deleteLibrary: () => dispatch(deleteLibrary()),
  showHideSeriesDetails: (series?: Series) =>
    dispatch(showHideSeriesDetails(series)),
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const DashboardPage: React.FC<Props> = (props: Props) => {
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
                <Button onClick={props.updateSeriesList}>
                  update the series list
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
                seriesList={props.library.seriesList}
              />
            </Route>
            <Route path="/series/:uuid" exact>
              <SeriesDetails library={props.library} />
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
