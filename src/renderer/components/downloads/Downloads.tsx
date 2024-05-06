import { Space } from '@mantine/core';
import React from 'react';
import DownloadQueue from './DownloadQueue';
import MyDownloads from './MyDownloads';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

const Downloads: React.FC<Props> = () => {
  return (
    <>
      <DownloadQueue />
      <Space h="md" />
      <MyDownloads />
    </>
  );
};

export default Downloads;
