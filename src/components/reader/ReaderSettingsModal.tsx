import React from 'react';
import { Modal } from 'antd';
import { useRecoilState } from 'recoil';
import ReaderSettings from '../settings/ReaderSettings';
import { showingSettingsModalState } from '../../state/readerStates';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const ReaderSettingsModal: React.FC<Props> = (props: Props) => {
  const [showingSettingsModal, setShowingSettingsModal] = useRecoilState(showingSettingsModalState);

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

export default ReaderSettingsModal;
