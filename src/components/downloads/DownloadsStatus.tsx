import React from 'react';
import { Row, Card, Progress, Collapse, Badge, Button } from 'antd';
import {
  CaretRightOutlined,
  CloseOutlined,
  PauseOutlined,
} from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import Paragraph from 'antd/lib/typography/Paragraph';
import Title from 'antd/lib/typography/Title';
import styles from './DownloadsStatus.css';
import { RootState } from '../../store';
import { DownloadError, DownloadTask } from '../../services/downloader';
import {
  clearDownloaderQueue,
  downloadChapters,
  pauseDownloader,
  startDownloader,
} from '../../features/downloader/actions';

const { Panel } = Collapse;

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
  clearDownloaderQueue: () => dispatch(clearDownloaderQueue()),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const DownloadsStatus: React.FC<Props> = (props: Props) => {
  const renderCurrentTask = () => {
    if (props.currentTask === null) return <></>;

    const percent =
      props.currentTask.page !== undefined &&
      props.currentTask.totalPages !== undefined
        ? Math.round(
            (props.currentTask.page / props.currentTask.totalPages) * 1000
          ) / 10
        : 0;

    const pageStr = `${
      props.currentTask.page === undefined ? '0' : props.currentTask.page
    }/${
      props.currentTask.totalPages === undefined
        ? '??'
        : props.currentTask.totalPages
    }`;

    return (
      <Card className={styles.currentTaskCard} bordered={false}>
        <Progress type="circle" percent={percent} />
        <Title level={4} className={styles.taskTitle}>
          {props.currentTask.series.title} - Chapter{' '}
          {props.currentTask.chapter.chapterNumber}
        </Title>
        <Paragraph className={styles.taskDetails}>Page {pageStr}</Paragraph>
      </Card>
    );
  };

  const renderErrorContainer = () => {
    if (props.downloadErrors.length === 0) return <></>;

    return (
      <Collapse className={styles.errorCollapse}>
        <Panel
          header={
            <>
              <Badge count={props.downloadErrors.length} /> View Errors
            </>
          }
          key="1"
        >
          {props.downloadErrors.map((downloadError: DownloadError) => (
            <Row key={Math.random()}>
              <Paragraph>
                Error downloading {downloadError.series.title} - Chapter{' '}
                {downloadError.chapter.chapterNumber}
                <br />
                {downloadError.errorStr}
              </Paragraph>
            </Row>
          ))}
        </Panel>
      </Collapse>
    );
  };

  const renderControls = () => {
    if (props.currentTask === null) {
      if (props.queue.length > 0) {
        return (
          <Row>
            <Button
              icon={<CaretRightOutlined />}
              onClick={() => props.startDownloader()}
            >
              Resume Download
            </Button>
            <Button
              icon={<CloseOutlined />}
              className={styles.clearButton}
              onClick={() => props.clearDownloaderQueue()}
            >
              Clear Queue
            </Button>
          </Row>
        );
      }
      return <></>;
    }

    return (
      <Row>
        <Button
          icon={<PauseOutlined />}
          onClick={() => props.pauseDownloader()}
        >
          Pause Download
        </Button>
        <Button
          icon={<CloseOutlined />}
          className={styles.clearButton}
          onClick={() => props.clearDownloaderQueue()}
        >
          Clear Queue
        </Button>
      </Row>
    );
  };

  if (
    props.currentTask === null &&
    props.queue.length === 0 &&
    props.downloadErrors.length === 0
  ) {
    return <Paragraph>There are no downloads queued.</Paragraph>;
  }

  return (
    <>
      {renderErrorContainer()}
      {renderCurrentTask()}
      {renderControls()}
      {props.queue.map((task: DownloadTask) => (
        <Card key={Math.random()} className={styles.queueCard} bordered={false}>
          <Title level={5} className={styles.taskTitle}>
            {task.series.title} - Chapter {task.chapter.chapterNumber}
          </Title>
        </Card>
      ))}
    </>
  );
};

export default connector(DownloadsStatus);
