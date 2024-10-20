const { ipcRenderer } = require('electron');
import React, { useEffect } from 'react';
import { Center, Loader } from '@mantine/core';
import styles from './ReaderLoader.module.css';
import ipcChannels from '@/common/constants/ipcChannels.json';

type Props = {
  extensionId: string | undefined;
};

const ReaderLoader: React.FC<Props> = (props: Props) => {
  useEffect(() => {
    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.GET, props.extensionId)
      .catch((e) => console.error(e));
  }, [props.extensionId]);

  return (
    <Center className={styles.container} bg="bg.0">
      <Loader />
    </Center>
  );
};

export default ReaderLoader;
