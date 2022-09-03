import { Tabs } from '@mantine/core';
import React from 'react';
import DownloadsStatus from './DownloadsStatus';
import MyDownloads from './MyDownloads';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

const Downloads: React.FC<Props> = (props: Props) => {
  return (
    <Tabs defaultValue="downloads">
      <Tabs.List>
        <Tabs.Tab value="downloads">My Downloads</Tabs.Tab>
        <Tabs.Tab value="queue">Queue</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="downloads" pt="md">
        <MyDownloads />
      </Tabs.Panel>

      <Tabs.Panel value="queue" pt="md">
        <DownloadsStatus />
      </Tabs.Panel>
    </Tabs>
  );
};

export default Downloads;
