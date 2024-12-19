import React from 'react';
import DownloadQueue from './DownloadQueue';
import MyDownloads from './MyDownloads';

const Downloads: React.FC = () => {
  return (
    <>
      <DownloadQueue />
      <div className="h-4" />
      <MyDownloads />
    </>
  );
};

export default Downloads;
