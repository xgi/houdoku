const { ipcRenderer } = require('electron');
import React, { useEffect } from 'react';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { Loader2 } from 'lucide-react';

type Props = {
  extensionId: string | undefined;
};

const ReaderLoader: React.FC<Props> = (props: Props) => {
  useEffect(() => {
    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.GET, props.extensionId)
      .catch((e) => console.error(e));
  }, [props.extensionId]);

  return (
    <div className="flex w-full h-[calc(100vh-64px)] justify-center items-center align-middle">
      <Loader2 className="animate-spin w-8 h-8" />
    </div>
  );
};

export default ReaderLoader;
