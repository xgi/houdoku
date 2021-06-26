import React from 'react';
import { Button, Tabs } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import { Chapter, Series } from 'houdoku-extension-lib';
import { RootState } from '../../store';
import { DownloadTask } from '../../services/downloader';
import db from '../../services/db';
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
  const tempAdd = async (id: number) => {
    const chapter: Chapter = await db
      .fetchChapter(id)
      .then((response: any) => response[0]);

    if (chapter.seriesId === undefined) return;
    const series: Series = await db
      .fetchSeries(chapter.seriesId)
      .then((response: any) => response[0]);

    props.downloadChapters([{ chapter, series } as DownloadTask]);
  };

  const tempStart = () => {
    props.startDownloader();
  };

  const tempPause = () => {
    props.pauseDownloader();
  };

  return (
    <Tabs defaultActiveKey="1" tabPosition="top">
      <TabPane tab="Status" key={1}>
        <DownloadsStatus />
      </TabPane>
      <TabPane tab="My Downloads" key={2}>
        <MyDownloads />
      </TabPane>
      <TabPane tab="temp" key={3}>
        <Button onClick={() => tempAdd(502)}>add 502 to queue + start</Button>
        <Button onClick={() => tempAdd(3)}>add 3 to queue + start</Button>
        <Button onClick={() => tempPause()}>pause downloader</Button>
        <Button onClick={() => tempStart()}>start downloader</Button>
      </TabPane>
    </Tabs>
  );
};

export default connector(Downloads);
