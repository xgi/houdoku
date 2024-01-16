import { ipcRenderer } from 'electron';
import log from 'electron-log';
import React, { useEffect } from 'react';
import { Loader } from '@mantine/core';
import styles from './ReaderLoader.css';
import ipcChannels from '../../constants/ipcChannels.json';

type Props = {
  extensionId: string | undefined;
};

const ReaderLoader: React.FC<Props> = (props: Props) => {
  useEffect(() => {
    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.GET, props.extensionId)
      .catch((e) => log.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.extensionId]);

  return (
    <div className={styles.container}>
      <Loader />
    </div>
  );
};

export default ReaderLoader;
