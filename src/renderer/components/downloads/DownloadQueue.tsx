import React from 'react';
import { useRecoilValue } from 'recoil';
import {
  Box,
  ScrollArea,
  Stack,
  Text,
  Title,
  Progress,
  Group,
  Button,
  Center,
} from '@mantine/core';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons';
import { downloaderClient, DownloadTask } from '@/renderer/services/downloader';
import { currentTaskState, queueState } from '@/renderer/state/downloaderStates';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const DownloadQueue: React.FC<Props> = (props: Props) => {
  const queue = useRecoilValue(queueState);
  const currentTask = useRecoilValue(currentTaskState);

  const renderHeader = () => {
    return (
      <Group mb="xs" position="apart">
        <Title order={3}>Download Queue</Title>
        {currentTask || queue.length > 0 ? (
          <Group spacing="xs">
            <Button variant="default" size="xs" onClick={() => downloaderClient.clear()}>
              Clear Queue
            </Button>
            {currentTask === null && queue.length > 0 ? (
              <Button
                size="xs"
                color="teal"
                leftIcon={<IconPlayerPlay size={16} />}
                onClick={() => downloaderClient.start()}
              >
                Resume
              </Button>
            ) : (
              <Button
                size="xs"
                color="orange"
                leftIcon={<IconPlayerPause size={16} />}
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
        key={`${task.series.id}-${task.chapter.id}`}
        mr="sm"
        p="xs"
        sx={(theme) => ({
          backgroundColor: theme.colors.dark[8],
        })}
      >
        <Group noWrap position="apart">
          <Text>{task.series.title}</Text>
          <Text>Chapter {task.chapter.chapterNumber}</Text>
        </Group>
        {task.page && task.totalPages ? (
          <Progress
            value={(task.page / task.totalPages) * 100}
            label={`${task.page} / ${task.totalPages}`}
            animate={task === currentTask}
            size="xl"
          />
        ) : (
          ''
        )}
      </Box>
    );
  };

  return (
    <>
      {renderHeader()}
      <ScrollArea
        type="always"
        style={{ height: '40vh', minHeight: 250 }}
        sx={(theme) => ({
          backgroundColor: theme.colors.dark[7],
        })}
      >
        <Stack spacing="sm" p="xs">
          {currentTask ? renderTask(currentTask) : ''}
          {queue.map((task: DownloadTask) => renderTask(task))}
          {currentTask === null && queue.length === 0 ? (
            <Center style={{ height: '36vh', minHeight: 225 }}>
              <Text>There are no downloads queued.</Text>
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
