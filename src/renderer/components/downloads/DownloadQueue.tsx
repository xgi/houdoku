import React from 'react';
import { useRecoilValue } from 'recoil';
import { Box, ScrollArea, Stack, Progress, Group, Button, Center } from '@mantine/core';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons';
import { downloaderClient, DownloadTask } from '@/renderer/services/downloader';
import { currentTaskState, queueState } from '@/renderer/state/downloaderStates';
import DefaultText from '../general/DefaultText';
import DefaultButton from '../general/DefaultButton';
import styles from './DownloadQueue.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { themeProps } from '@/renderer/util/themes';
import DefaultTitle from '../general/DefaultTitle';

const DownloadQueue: React.FC = () => {
  const theme = useRecoilValue(themeState);
  const queue = useRecoilValue(queueState);
  const currentTask = useRecoilValue(currentTaskState);

  const renderHeader = () => {
    return (
      <Group pt="sm" mb="xs" justify={'space-between'}>
        <DefaultTitle order={3}>Download Queue</DefaultTitle>
        {currentTask || queue.length > 0 ? (
          <Group gap="xs">
            <DefaultButton variant="default" size="xs" onClick={() => downloaderClient.clear()}>
              Clear Queue
            </DefaultButton>
            {currentTask === null && queue.length > 0 ? (
              <Button
                size="xs"
                color="teal"
                leftSection={<IconPlayerPlay size={16} />}
                onClick={() => downloaderClient.start()}
              >
                Resume
              </Button>
            ) : (
              <Button
                size="xs"
                color="orange"
                leftSection={<IconPlayerPause size={16} />}
                onClick={() => downloaderClient.pause()}
              >
                Pause
              </Button>
            )}
          </Group>
        ) : (
          ''
        )}
      </Group>
    );
  };

  const renderTask = (task: DownloadTask) => {
    return (
      <Box
        {...themeProps(theme)}
        key={`${task.series.id}-${task.chapter.id}`}
        mr="sm"
        p="xs"
        className={styles.task}
      >
        <Group wrap="nowrap" justify="space-between">
          <DefaultText>{task.series.title}</DefaultText>
          <DefaultText>Chapter {task.chapter.chapterNumber}</DefaultText>
        </Group>
        {task.page && task.totalPages ? (
          <Progress.Root size="xl">
            <Progress.Section
              value={(task.page / task.totalPages) * 100}
              animated={task === currentTask}
            >
              <Progress.Label>
                {task.page} / {task.totalPages}
              </Progress.Label>
            </Progress.Section>
          </Progress.Root>
        ) : (
          ''
        )}
      </Box>
    );
  };

  return (
    <>
      {renderHeader()}
      <ScrollArea type="always" style={{ height: '40vh', minHeight: 250 }}>
        <Stack gap="sm" p="xs">
          {currentTask ? renderTask(currentTask) : ''}
          {queue.map((task: DownloadTask) => renderTask(task))}
          {currentTask === null && queue.length === 0 ? (
            <Center style={{ height: '36vh', minHeight: 225 }}>
              <DefaultText>There are no downloads queued.</DefaultText>
            </Center>
          ) : (
            ''
          )}
        </Stack>
      </ScrollArea>
    </>
  );
};

export default DownloadQueue;
