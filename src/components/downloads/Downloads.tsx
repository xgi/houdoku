import React from 'react';
import { Tabs } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../store';
import DownloadsStatus from './DownloadsStatus';
import MyDownloads from './MyDownloads';

const { TabPane } = Tabs;

const mapState = (state: RootState) => ({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const Downloads: React.FC<Props> = (props: Props) => {
  return (
    <Tabs defaultActiveKey="1" tabPosition="top">
      <TabPane tab="My Downloads" key={1}>
        <MyDownloads />
      </TabPane>
      <TabPane tab="Queue" key={2}>
        <DownloadsStatus />
      </TabPane>
    </Tabs>
  );
};

export default connector(Downloads);
