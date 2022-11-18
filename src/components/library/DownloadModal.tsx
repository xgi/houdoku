import React, { useState } from 'react';
import { Series } from 'houdoku-extension-lib';
import { useRecoilValue } from 'recoil';
import { ipcRenderer } from 'electron';
import { ActionIcon, Button, Group, Modal, NumberInput, Text } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons';
import ipcChannels from '../../constants/ipcChannels.json';
import { customDownloadsDirState } from '../../state/settingStates';
import { sortedFilteredChapterListState } from '../../state/libraryStates';
import { downloadNextX } from '../../features/library/chapterDownloadUtils';
import { queueState } from '../../state/downloaderStates';

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
      amount
    );
    props.close();
  };

  return (
    <Modal opened={props.visible} centered title="Download chapters" onClose={props.close}>
      <Group spacing={5}>
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
