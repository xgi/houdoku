import React from 'react';
import { useRecoilState } from 'recoil';
import { showingSettingsModalState } from '@/renderer/state/readerStates';
import DefaultModal from '../general/DefaultModal';

const ReaderSettingsModal: React.FC = () => {
  const [showingSettingsModal, setShowingSettingsModal] = useRecoilState(showingSettingsModalState);

  return (
    <DefaultModal
      opened={showingSettingsModal}
      // centered
      size="md"
      title="Reader Settings"
      onClose={() => setShowingSettingsModal(!showingSettingsModal)}
    >
      {/* <ReaderSettings /> */}
    </DefaultModal>
  );
};

export default ReaderSettingsModal;
