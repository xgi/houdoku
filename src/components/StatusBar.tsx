import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Layout } from 'antd';
import { RootState } from '../store';
import { setStatusText } from '../statusbar/actions';
import styles from './StatusBar.css';

const { Footer } = Layout;

const mapState = (state: RootState) => ({
  text: state.status.text,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const StatusBar: React.FC<Props> = (props: Props) => {
  return (
    <Footer className={styles.statusBar}>
      <p style={{ marginBottom: 0 }}>{props.text}</p>
    </Footer>
  );
};

export default connector(StatusBar);
