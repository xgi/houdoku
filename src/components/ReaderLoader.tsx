import { Spin } from 'antd';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { EXTENSIONS } from '../services/extension';
import { RootState } from '../store';
import styles from './ReaderLoader.css';

const mapState = (state: RootState) => ({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {
  extensionId: number | undefined;
};

const ReaderLoader: React.FC<Props> = (props: Props) => {
  const renderExtensionMessage = () => {
    if (props.extensionId !== undefined) {
      const message = EXTENSIONS[props.extensionId].METADATA.pageLoadMessage;
      if (message !== '') {
        return <p>{message}</p>;
      }
    }
    return <></>;
  };

  return (
    <>
      <Spin />
      <p>Loading pages...</p>
      {renderExtensionMessage()}
    </>
  );
};

export default connector(ReaderLoader);
