import React from 'react';
import { Tabs } from '@mantine/core';
import TrackerSettings from './TrackerSettings';
import IntegrationSettings from './IntegrationSettings';
import ReaderSettings from './ReaderSettings';
import GeneralSettings from './GeneralSettings';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

const Settings: React.FC<Props> = (props: Props) => {
  return (
    <Tabs defaultValue="general">
      <Tabs.List>
        <Tabs.Tab value="general">General</Tabs.Tab>
        <Tabs.Tab value="reader">Reader</Tabs.Tab>
        <Tabs.Tab value="trackers">Trackers</Tabs.Tab>
        <Tabs.Tab value="integrations">Integrations</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="general" pt="md">
        <GeneralSettings />
      </Tabs.Panel>
      <Tabs.Panel value="reader" pt="md">
        <ReaderSettings />
      </Tabs.Panel>
      <Tabs.Panel value="trackers" pt="md">
        <TrackerSettings />
      </Tabs.Panel>
      <Tabs.Panel value="integrations" pt="md">
        <IntegrationSettings />
      </Tabs.Panel>
    </Tabs>
  );
};

export default Settings;
