import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { ExtensionMetadata } from 'houdoku-extension-lib';
import { Box, Button, Group, Modal, Text } from '@mantine/core';
import ipcChannels from '../../constants/ipcChannels.json';

type Props = {
  visible: boolean;
  toggleVisible: () => void;
};

const InstalledExtensionsModal: React.FC<Props> = (props: Props) => {
  const [extensionMetadataList, setExtensionMetadataList] = useState<ExtensionMetadata[]>([]);

  const loadExtensionList = async () => {
    log.debug('Loading extension metadata list for installed extensions modal');

    const list = await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.GET_ALL);

    setExtensionMetadataList(
      list.filter((metadata: ExtensionMetadata) => metadata.name !== 'filesystem')
    );
  };

  const reloadExtensions = async () => {
    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.RELOAD)
      .then(() => loadExtensionList())
      .catch((e) => log.error(e));
  };

  useEffect(() => {
    loadExtensionList();
  }, []);

  return (
    <Modal
      title="Installed Extensions"
      opened={props.visible}
      onClose={props.toggleVisible}
      size="md"
    >
      <Group position="apart" mb="sm">
        <Text>Loaded {extensionMetadataList.length} extension(s)</Text>
        <Button variant="default" onClick={reloadExtensions}>
          Reload Extensions
        </Button>
      </Group>

      {extensionMetadataList.map((item) => {
        return (
          <Box mb="sm">
            <Group position="apart">
              <Text>
                {item.name} -{' '}
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.url}
                </a>
              </Text>
              <Text>{item.version}</Text>
            </Group>
            <Text color="dimmed">{item.id}</Text>
          </Box>
        );
      })}
    </Modal>
  );
};

export default InstalledExtensionsModal;
