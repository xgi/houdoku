import React from 'react';
import { Tabs } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../store';
import { DownloadTask } from '../../services/downloader';
import {
  downloadChapters,
  pauseDownloader,
  startDownloader,
} from '../../features/downloader/actions';
import DownloadsStatus from './DownloadsStatus';
import MyDownloads from './MyDownloads';

const { TabPane } = Tabs;

const mapState = (state: RootState) => ({
  queue: state.downloader.queue,
  currentTask: state.downloader.currentTask,
  downloadErrors: state.downloader.downloadErrors,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  downloadChapters: (tasks: DownloadTask[]) =>
    dispatch(downloadChapters(tasks)),
  pauseDownloader: () => dispatch(pauseDownloader()),
  startDownloader: () => dispatch(startDownloader()),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const Downloads: React.FC<Props> = (props: Props) => {
  return (
    <Tabs defaultActiveKey="1" tabPosition="top">
      <TabPane tab="Status" key={1}>
        <DownloadsStatus />
      </TabPane>
      <TabPane tab="My Downloads" key={2}>
        <MyDownloads />
      </TabPane>
    </Tabs>
  );
};

export default connector(Downloads);
