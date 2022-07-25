import React from 'react';
import { Modal } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import { useRecoilState } from 'recoil';
import { RootState } from '../../store';
import ReaderSettings from '../settings/ReaderSettings';
import { showingSettingsModalState } from '../../state/readerStates';

const mapState = (state: RootState) => ({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderSettingsModal: React.FC<Props> = (props: Props) => {
  const [showingSettingsModal, setShowingSettingsModal] = useRecoilState(
    showingSettingsModalState
  );

  return (
    <Modal
      title="Reader Settings"
      visible={showingSettingsModal}
      footer={null}
      onCancel={() => setShowingSettingsModal(!showingSettingsModal)}
    >
      <ReaderSettings />
    </Modal>
  );
};

export default connector(ReaderSettingsModal);
