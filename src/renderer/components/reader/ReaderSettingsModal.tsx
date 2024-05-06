import React from 'react';
import { useRecoilState } from 'recoil';
import { Modal } from '@mantine/core';
import ReaderSettings from '../settings/ReaderSettings';
import { showingSettingsModalState } from '@/renderer/state/readerStates';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const ReaderSettingsModal: React.FC<Props> = () => {
  const [showingSettingsModal, setShowingSettingsModal] = useRecoilState(showingSettingsModalState);

  return (
    <Modal
      opened={showingSettingsModal}
      // centered
      size="md"
      title="Reader Settings"
      onClose={() => setShowingSettingsModal(!showingSettingsModal)}
    >
      <ReaderSettings />
    </Modal>
  );
};

export default ReaderSettingsModal;
