import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Layout, Menu, Breadcrumb, Button } from 'antd';
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
// import styles from './LibraryPage.css';
// import blankCover from '../img/blank_cover.png';
import LibraryGrid from './LibraryGrid';
import {
  updateSeriesList,
  changeNumColumns,
  saveLibrary,
  readLibrary,
  deleteLibrary,
  showHideSeriesDetails,
} from '../actions/libraryActions';
import { setStatusText } from '../actions/statusActions';
import Series from '../models/series';
import SeriesDetails from './SeriesDetails';
import StatusBar from './StatusBar';

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

const LibraryPage: React.FC<Props> = (props: Props) => {
  const renderMainContent = () => {
    if (props.showingSeries) {
      return (
        <SeriesDetails
          series={props.showingSeries}
          seriesDetailsCallback={props.showHideSeriesDetails}
        />
      );
    }

    if (props.library != null) {
      return (
        <LibraryGrid
          columns={props.columns}
          seriesList={props.library.seriesList}
          seriesDetailsCallback={props.showHideSeriesDetails}
        />
      );
    }

    return <p>test</p>;
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
        }}
      >
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            Option 1
          </Menu.Item>
          <Menu.Item key="2" icon={<DesktopOutlined />}>
            Option 2
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
      <Layout
        className="site-layout"
        style={{
          marginLeft: 200,
          height: 'calc(100vh - 32px)',
          borderBottom: '1px solid grey',
        }}
      >
        <Content style={{ margin: '0px 16px 0', overflow: 'initial' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>Houdoku</Breadcrumb.Item>
            <Breadcrumb.Item>Library</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ padding: 8 }}>
            <Button onClick={props.updateSeriesList}>
              update the series list
            </Button>
            <Button onClick={() => props.changeNumColumns(8)}>
              update num columns
            </Button>
            <Button onClick={() => props.saveLibrary()}>save library</Button>
            <Button onClick={() => props.readLibrary()}>read library</Button>
            <Button onClick={() => props.deleteLibrary()}>
              delete library
            </Button>
            <Button onClick={() => props.setStatusText('new status')}>
              set status
            </Button>
            {renderMainContent()}
          </div>
        </Content>
      </Layout>
      <StatusBar />
    </Layout>
  );
};

export default connector(LibraryPage);
