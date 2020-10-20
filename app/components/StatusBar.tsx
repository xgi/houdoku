import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Layout } from 'antd';
import { RootState } from '../store';
import { setStatusText } from '../statusbar/actions';

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
    <Footer
      style={{
        textAlign: 'center',
        backgroundColor: 'lightgrey',
        position: 'fixed',
        width: '100%',
        bottom: 0,
        height: '32px',
        padding: '5px 50px',
      }}
    >
      <p style={{ marginBottom: 0 }}>{props.text}</p>
    </Footer>
  );
};

export default connector(StatusBar);
