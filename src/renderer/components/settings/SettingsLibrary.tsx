import React from 'react';
const { ipcRenderer } = require('electron');
import { useRecoilState } from 'recoil';
import ipcChannels from '@/common/constants/ipcChannels.json';
import {
  confirmRemoveSeriesState,
  customDownloadsDirState,
  libraryCropCoversState,
  refreshOnStartState,
} from '@/renderer/state/settingStates';
import { Checkbox } from '@/ui/components/Checkbox';
import { Label } from '@/ui/components/Label';
import { Input } from '@/ui/components/Input';
import { Button } from '@/ui/components/Button';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

export const SettingsLibrary: React.FC = () => {
  const [refreshOnStart, setRefreshOnStart] = useRecoilState(refreshOnStartState);
  const [confirmRemoveSeries, setConfirmRemoveSeries] = useRecoilState(confirmRemoveSeriesState);
  const [libraryCropCovers, setLibraryCropCovers] = useRecoilState(libraryCropCoversState);
  const [customDownloadsDir, setCustomDownloadsDir] = useRecoilState(customDownloadsDirState);

  return (
    <>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="checkboxLibraryAutoRefresh"
            checked={refreshOnStart}
            onCheckedChange={(checked) => setRefreshOnStart(checked === true)}
          />
          <Label htmlFor="checkboxLibraryAutoRefresh" className="font-normal">
            Refresh library on startup
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="checkboxLibraryConfirmRemove"
            checked={confirmRemoveSeries}
            onCheckedChange={(checked) => setConfirmRemoveSeries(checked === true)}
          />
          <Label htmlFor="checkboxLibraryConfirmRemove" className="font-normal">
            Confirm when removing series from library
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="checkboxLibraryCropCovers"
            checked={libraryCropCovers}
            onCheckedChange={(checked) => setLibraryCropCovers(checked === true)}
          />
          <Label htmlFor="checkboxLibraryCropCovers" className="font-normal">
            Crop cover images to library grid
          </Label>
        </div>
      </div>

      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="picture">Custom download location</Label>
        <div className="flex w-full items-center space-x-2">
          <Input
            className="cursor-pointer"
            value={customDownloadsDir || defaultDownloadsDir}
            onClick={() =>
              ipcRenderer
                .invoke(ipcChannels.APP.SHOW_OPEN_DIALOG, true, [], 'Select Downloads Directory')
                .then((fileList: string) => {
                  if (fileList.length > 0) {
                    setCustomDownloadsDir(fileList[0]);
                  }
                })
            }
          />
          {customDownloadsDir && <Button onClick={() => setCustomDownloadsDir('')}>Reset</Button>}
        </div>
      </div>
    </>
  );
};
