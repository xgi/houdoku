import React from 'react';
import { Tabs } from 'antd';
import DownloadsStatus from './DownloadsStatus';
import MyDownloads from './MyDownloads';

const { TabPane } = Tabs;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

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

export default Downloads;
