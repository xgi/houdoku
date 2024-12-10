import { titlebarTextState } from '@/renderer/state/libraryStates';
import { useRecoilValue } from 'recoil';
import packageJson from '../../../../package.json';
const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';
import { MinusIcon, SquareIcon, XIcon } from 'lucide-react';

export const Titlebar: React.FC = () => {
  const text = useRecoilValue(titlebarTextState);

  const formattedText = text ? `${packageJson.productName} - ${text}` : packageJson.productName;

  return (
    <div className="bg-background text-foreground select-none flex justify-between items-center fixed top-0 h-[24px] w-full p-0.5 z-50 overflow-hidden">
      <div className="ml-2 overflow-hidden text-xs font-sans font-bold tracking-tighter text-muted-foreground">
        <span>{formattedText}</span>
      </div>
      <div className="flex justify-end">
        <button
          className="hover:!bg-foreground hover:!text-background h-[24px] w-[46px] flex items-center justify-center"
          onClick={() => ipcRenderer.invoke(ipcChannels.WINDOW.MINIMIZE)}
        >
          <MinusIcon width={14} height={14} />
        </button>
        <button
          className="hover:!bg-foreground hover:!text-background h-[24px] w-[46px] flex items-center justify-center"
          onClick={() => ipcRenderer.invoke(ipcChannels.WINDOW.MAX_RESTORE)}
        >
          <SquareIcon width={14} height={14} />
        </button>
        <button
          className="hover:!bg-red-500 hover:!text-white h-[24px] w-[46px] flex items-center justify-center"
          onClick={() => ipcRenderer.invoke(ipcChannels.WINDOW.CLOSE)}
        >
          <XIcon width={18} height={18} />
        </button>
      </div>
    </div>
  );
};
