import React from 'react';
import { Modal } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../store';
import { toggleShowingSettingsModal } from '../../features/reader/actions';
import ReaderSettings from '../settings/ReaderSettings';

const mapState = (state: RootState) => ({
  showingSettingsModal: state.reader.showingSettingsModal,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  toggleShowingSettingsModal: () => dispatch(toggleShowingSettingsModal()),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderSettingsModal: React.FC<Props> = (props: Props) => {
  return (
    <Modal
      title="Reader Settings"
      visible={props.showingSettingsModal}
      footer={null}
      onCancel={props.toggleShowingSettingsModal}
    >
      <ReaderSettings />
    </Modal>
  );
};

export default connector(ReaderSettingsModal);
