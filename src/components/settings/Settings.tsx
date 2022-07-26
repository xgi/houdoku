import React from 'react';
import { Tabs } from 'antd';
import TrackerSettings from './TrackerSettings';
import IntegrationSettings from './IntegrationSettings';
import ReaderSettings from './ReaderSettings';
import GeneralSettings from './GeneralSettings';

const { TabPane } = Tabs;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const Settings: React.FC<Props> = (props: Props) => {
  return (
    <Tabs defaultActiveKey="1" tabPosition="top">
      <TabPane tab="General" key={1}>
        <GeneralSettings />
      </TabPane>
      <TabPane tab="Reader" key={2}>
        <ReaderSettings />
      </TabPane>
      <TabPane tab="Trackers" key={3}>
        <TrackerSettings />
      </TabPane>
      <TabPane tab="Integrations" key={4}>
        <IntegrationSettings />
      </TabPane>
    </Tabs>
  );
};

export default Settings;
