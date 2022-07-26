import React from 'react';
import { Layout } from 'antd';
import { useRecoilValue } from 'recoil';
import styles from './StatusBar.css';
import { statusTextState } from '../../state/statusBarStates';

const { Footer } = Layout;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const StatusBar: React.FC<Props> = (props: Props) => {
  const statusText = useRecoilValue(statusTextState);

  return (
    <Footer className={styles.statusBar}>
      <p className={styles.text}>{statusText}</p>
    </Footer>
  );
};

export default StatusBar;
