import React from 'react';
import { Row, Card, Progress, Collapse, Badge, Button } from 'antd';
import {
  CaretRightOutlined,
  CloseOutlined,
  PauseOutlined,
} from '@ant-design/icons';
import Paragraph from 'antd/lib/typography/Paragraph';
import Title from 'antd/lib/typography/Title';
import { useRecoilValue } from 'recoil';
import styles from './DownloadsStatus.css';
import {
  downloaderClient,
  DownloadError,
  DownloadTask,
} from '../../services/downloader';
import {
  currentTaskState,
  downloadErrorsState,
  queueState,
} from '../../state/downloaderStates';

const { Panel } = Collapse;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const DownloadsStatus: React.FC<Props> = (props: Props) => {
  const queue = useRecoilValue(queueState);
  const currentTask = useRecoilValue(currentTaskState);
  const downloadErrors = useRecoilValue(downloadErrorsState);

  const renderCurrentTask = () => {
    if (currentTask === null) return <></>;

    const percent =
      currentTask.page !== undefined && currentTask.totalPages !== undefined
        ? Math.round((currentTask.page / currentTask.totalPages) * 1000) / 10
        : 0;

    const pageStr = `${
      currentTask.page === undefined ? '0' : currentTask.page
    }/${currentTask.totalPages === undefined ? '??' : currentTask.totalPages}`;

    return (
      <Card className={styles.currentTaskCard} bordered={false}>
        <Progress type="circle" percent={percent} />
        <Title level={4} className={styles.taskTitle}>
          {currentTask.series.title} - Chapter{' '}
          {currentTask.chapter.chapterNumber}
        </Title>
        <Paragraph className={styles.taskDetails}>Page {pageStr}</Paragraph>
      </Card>
    );
  };

  const renderErrorContainer = () => {
    if (downloadErrors.length === 0) return <></>;

    return (
      <Collapse className={styles.errorCollapse}>
        <Panel
          header={
            <>
              <Badge count={downloadErrors.length} /> View Errors
            </>
          }
          key="1"
        >
          {downloadErrors.map((downloadError: DownloadError) => (
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
    if (currentTask === null) {
      if (queue.length > 0) {
        return (
          <Row>
            <Button
              icon={<CaretRightOutlined />}
              onClick={() => downloaderClient.start()}
            >
              Resume Download
            </Button>
            <Button
              icon={<CloseOutlined />}
              className={styles.clearButton}
              onClick={() => downloaderClient.clear()}
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
          onClick={() => downloaderClient.pause()}
        >
          Pause Download
        </Button>
        <Button
          icon={<CloseOutlined />}
          className={styles.clearButton}
          onClick={() => downloaderClient.clear()}
        >
          Clear Queue
        </Button>
      </Row>
    );
  };

  if (
    currentTask === null &&
    queue.length === 0 &&
    downloadErrors.length === 0
  ) {
    return <Paragraph>There are no downloads queued.</Paragraph>;
  }

  return (
    <>
      {renderErrorContainer()}
      {renderCurrentTask()}
      {renderControls()}
      {queue.map((task: DownloadTask) => (
        <Card key={Math.random()} className={styles.queueCard} bordered={false}>
          <Title level={5} className={styles.taskTitle}>
            {task.series.title} - Chapter {task.chapter.chapterNumber}
          </Title>
        </Card>
      ))}
    </>
  );
};

export default DownloadsStatus;
