import React, { useState } from 'react';
import { Chapter, Series } from 'houdoku-extension-lib';
import { useRecoilValue } from 'recoil';
import { ipcRenderer } from 'electron';
import { ActionIcon, Button, Checkbox, Group, Modal, NumberInput, Text } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons';
import { downloaderClient, DownloadTask } from '../../services/downloader';
import ipcChannels from '../../constants/ipcChannels.json';
import { customDownloadsDirState } from '../../state/settingStates';
import { getChapterDownloaded } from '../../util/filesystem';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

type Props = {
  series: Series;
  chapter: Chapter | null;
  chapterList: Chapter[];
  direction: 'next' | 'previous';
  close: () => void;
};

const DownloadModal: React.FC<Props> = (props: Props) => {
  const [ignoreRead, setIgnoreRead] = useState(false);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const [amount, setAmount] = useState(5);

  const downloadFunc = () => {
    if (props.chapter !== null) {
      const startIndex = props.chapterList.indexOf(props.chapter);
      if (startIndex < 0) return;

      const queue: Chapter[] = [];
      [...Array(amount).keys()]
        .map((x) => x + 1)
        .forEach((x) => {
          const delta = props.direction === 'previous' ? x : -x;

          const chapter = props.chapterList[startIndex + delta];
          if (
            chapter &&
            !getChapterDownloaded(
              props.series,
              chapter,
              customDownloadsDir || defaultDownloadsDir
            ) &&
            (!ignoreRead || (ignoreRead && !chapter.read))
          ) {
            queue.push(chapter);
          }
        });

      downloaderClient.add(
        queue.map(
          (chapter: Chapter) =>
            ({
              chapter,
              series: props.series,
              downloadsDir: customDownloadsDir || defaultDownloadsDir,
            } as DownloadTask)
        )
      );
      downloaderClient.start();
    }
    props.close();
  };

  return (
    <Modal opened={props.chapter !== null} centered title="Download chapters" onClose={props.close}>
      <Group spacing={5}>
        <Text size="sm" mr="xs">
          Download {props.direction}
        </Text>
        <ActionIcon variant="default" onClick={() => setAmount(amount > 0 ? amount - 1 : 0)}>
          <IconMinus size={16} />
        </ActionIcon>

        <NumberInput
          hideControls
          value={amount}
          min={0}
          onChange={(value: number) => setAmount(value)}
          size="xs"
          styles={{ input: { width: 54, textAlign: 'center' } }}
        />

        <ActionIcon variant="default" onClick={() => setAmount(amount + 1)}>
          <IconPlus size={16} />
        </ActionIcon>
        <Text size="sm" ml="xs">
          chapters.
        </Text>
      </Group>
      <Checkbox
        mt="sm"
        label="Ignore read chapters"
        checked={ignoreRead}
        onChange={(e) => setIgnoreRead(e.target.checked)}
      />
      <Group position="right" mt="md">
        <Button variant="default" onClick={props.close}>
          Cancel
        </Button>
        <Button onClick={downloadFunc}>Download</Button>
      </Group>
    </Modal>
  );
};

export default DownloadModal;
