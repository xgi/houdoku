import { Spin } from 'antd';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { ExtensionMetadata } from 'houdoku-extension-lib';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../store';
import styles from './ReaderLoader.css';
import ipcChannels from '../../constants/ipcChannels.json';

const mapState = (state: RootState) => ({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {
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
    <>
      <Spin />
      <p>Loading pages...</p>
      {extensionMessage ? <p>{extensionMessage}</p> : <></>}
    </>
  );
};

export default connector(ReaderLoader);
