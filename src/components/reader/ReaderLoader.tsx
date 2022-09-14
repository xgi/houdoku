import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { ExtensionMetadata } from 'houdoku-extension-lib';
import React, { useEffect, useState } from 'react';
import { Loader } from '@mantine/core';
import styles from './ReaderLoader.css';
import ipcChannels from '../../constants/ipcChannels.json';

type Props = {
  extensionId: string | undefined;
};

const ReaderLoader: React.FC<Props> = (props: Props) => {
  const [extensionMessage, setExtensionMessage] = useState('');

  useEffect(() => {
    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.GET, props.extensionId)
      .then((metadata: ExtensionMetadata | undefined) => {
        // eslint-disable-next-line promise/always-return
        if (metadata && metadata.pageLoadMessage !== '') {
          setExtensionMessage(metadata.pageLoadMessage);
        }
      })
      .catch((e) => log.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.extensionId]);

  return (
    <div className={styles.container}>
      <Loader />
      {extensionMessage ? <p>{extensionMessage}</p> : <></>}
    </div>
  );
};

export default ReaderLoader;
