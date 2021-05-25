import React, { useEffect, useState } from 'react';
import { Button, List, Modal, Spin } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { ExtensionMetadata } from 'houdoku-extension-lib';
import styles from './InstalledExtensionsModal.css';
import ipcChannels from '../../constants/ipcChannels.json';

type Props = {
  visible: boolean;
  toggleVisible: () => void;
};

const InstalledExtensionsModal: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [extensionMetadataList, setExtensionMetadataList] = useState<
    ExtensionMetadata[]
  >([]);

  const loadExtensionList = async () => {
    setLoading(true);
    log.debug('Loading extension metadata list for installed extensions modal');

    const list = await ipcRenderer.invoke(
      ipcChannels.EXTENSION_MANAGER.GET_ALL
    );

    setExtensionMetadataList(
      list.filter(
        (metadata: ExtensionMetadata) => metadata.name !== 'filesystem'
      )
    );

    setLoading(false);
  };

  const reloadExtensions = async () => {
    setLoading(true);

    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.RELOAD)
      .then(() => loadExtensionList())
      .catch((e) => log.error(e));
  };

  useEffect(() => {
    loadExtensionList();
  }, []);

  if (loading) {
    return (
      <Modal
        title="Installed Extensions"
        visible={props.visible}
        footer={null}
        onCancel={props.toggleVisible}
      >
        <div className={styles.loaderContainer}>
          <Spin />
          <Paragraph>Loading extension details...</Paragraph>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Installed Extensions"
      visible={props.visible}
      footer={null}
      onCancel={props.toggleVisible}
    >
      <div className={styles.controlRow}>
        <Paragraph>
          Loaded {extensionMetadataList.length} extension(s)
        </Paragraph>
        <Button className={styles.reloadButton} onClick={reloadExtensions}>
          Reload Extensions
        </Button>
      </div>
      <List
        header={null}
        footer={null}
        bordered
        dataSource={extensionMetadataList}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            extra={<Paragraph>{item.version}</Paragraph>}
          >
            {/* {item.name} <a href={item.url}>{item.url}</a>) */}
            <List.Item.Meta
              title={
                <Paragraph className={styles.listItemTitle}>
                  {item.name} (
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.url}
                  </a>
                  )
                </Paragraph>
              }
              description={item.id}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default InstalledExtensionsModal;
