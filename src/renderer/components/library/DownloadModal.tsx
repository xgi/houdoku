import React, { useState } from 'react';
import { Series } from '@tiyo/common';
import { useRecoilValue } from 'recoil';
const { ipcRenderer } = require('electron');
import { ActionIcon, Button, Group, Modal, NumberInput, Text } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { customDownloadsDirState } from '@/renderer/state/settingStates';
import { sortedFilteredChapterListState } from '@/renderer/state/libraryStates';
import { downloadNextX } from '@/renderer/features/library/chapterDownloadUtils';
import { queueState } from '@/renderer/state/downloaderStates';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

type Props = {
  series: Series;
  visible: boolean;
  close: () => void;
};

const DownloadModal: React.FC<Props> = (props: Props) => {
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const sortedFilteredChapterList = useRecoilValue(sortedFilteredChapterListState);
  const downloadQueue = useRecoilValue(queueState);
  const [amount, setAmount] = useState(5);

  const downloadFunc = () => {
    downloadNextX(
      sortedFilteredChapterList,
      props.series,
      customDownloadsDir || defaultDownloadsDir,
      downloadQueue,
      amount,
    );
    props.close();
  };

  return (
    <Modal opened={props.visible} centered title="Download chapters" onClose={props.close}>
      <Group gap={5}>
        <Text size="sm" mr="xs">
          Download next
        </Text>
        <ActionIcon variant="default" onClick={() => setAmount(amount > 0 ? amount - 1 : 0)}>
          <IconMinus size={16} />
        </ActionIcon>

        <NumberInput
          hideControls
          value={amount}
          min={0}
          onChange={(value) => (typeof value === 'number' ? setAmount(value) : setAmount(0))}
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
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={props.close}>
          Cancel
        </Button>
        <Button onClick={downloadFunc}>Download</Button>
      </Group>
    </Modal>
  );
};

export default DownloadModal;
