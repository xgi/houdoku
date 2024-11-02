import React from 'react';
import { Tabs } from '@mantine/core';
import TrackerSettings from './TrackerSettings';
import IntegrationSettings from './IntegrationSettings';
import ReaderSettings from './ReaderSettings';
import GeneralSettings from './GeneralSettings';
import styles from './Settings.module.css';
import { useRecoilValue } from 'recoil';
import { themeState } from '@/renderer/state/settingStates';
import { themeProps } from '@/renderer/util/themes';

const Settings: React.FC = () => {
  const theme = useRecoilValue(themeState);

  return (
    <Tabs {...themeProps(theme)} classNames={{ root: styles.root }} defaultValue="general">
      <Tabs.List {...themeProps(theme)} classNames={{ list: styles.list }}>
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
