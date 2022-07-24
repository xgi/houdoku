import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Layout } from 'antd';
import { useRecoilValue } from 'recoil';
import { RootState } from '../../store';
import styles from './StatusBar.css';
import { statusTextState } from '../../state/statusBarStates';

const { Footer } = Layout;

const mapState = (state: RootState) => ({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const StatusBar: React.FC<Props> = (props: Props) => {
  const statusText = useRecoilValue(statusTextState);

  return (
    <Footer className={styles.statusBar}>
      <p className={styles.text}>{statusText}</p>
    </Footer>
  );
};

export default connector(StatusBar);
