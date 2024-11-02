import { Space } from '@mantine/core';
import React from 'react';
import DownloadQueue from './DownloadQueue';
import MyDownloads from './MyDownloads';

const Downloads: React.FC = () => {
  return (
    <>
      <DownloadQueue />
      <Space h="md" />
      <MyDownloads />
    </>
  );
};

export default Downloads;
