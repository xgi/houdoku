import React from 'react';
const { ipcRenderer } = require('electron');
import { useRecoilState } from 'recoil';
import { ApplicationTheme } from '@/common/models/types';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { createBackup, restoreBackup } from '@/renderer/util/backup';
import {
  autoBackupState,
  autoBackupCountState,
  themeState,
  autoCheckForUpdatesState,
} from '@/renderer/state/settingStates';
import { Checkbox } from '@houdoku/ui/components/Checkbox';
import { Label } from '@houdoku/ui/components/Label';
import { Switch } from '@houdoku/ui/components/Switch';
import { Input } from '@houdoku/ui/components/Input';
import { Button } from '@houdoku/ui/components/Button';
import { RadioGroup } from '@houdoku/ui/components/RadioGroup';
import { cn } from '@houdoku/ui/util';

export const SettingsGeneral: React.FC = () => {
  const [theme, setTheme] = useRecoilState(themeState);
  const [autoCheckForUpdates, setAutoCheckForUpdates] = useRecoilState(autoCheckForUpdatesState);
  const [autoBackup, setAutoBackup] = useRecoilState(autoBackupState);
  const [autoBackupCount, setAutoBackupCount] = useRecoilState(autoBackupCountState);

  const handleRestoreBackup = () => {
    ipcRenderer
      .invoke(
        ipcChannels.APP.SHOW_OPEN_DIALOG,
        false,
        [
          {
            name: 'Houdoku Backup',
            extensions: ['json'],
          },
        ],
        'Select backup file',
      )
      .then((fileList: string) => {
        if (fileList.length > 0) {
          return ipcRenderer.invoke(ipcChannels.APP.READ_ENTIRE_FILE, fileList[0]);
        }
        return false;
      })
      .then((fileContent: string) => {
        if (fileContent) restoreBackup(fileContent);
      })
      .catch(console.error);
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="checkboxCheckForUpdatesAutomatically"
          checked={autoCheckForUpdates}
          onCheckedChange={(checked) => setAutoCheckForUpdates(checked === true)}
        />
        <Label htmlFor="checkboxCheckForUpdatesAutomatically" className="font-normal">
          Check for Houdoku updates automatically
        </Label>
      </div>

      <div className="flex flex-col space-y-2">
        <div>
          <h3 className="pb-0 mb-0 font-medium">Theme</h3>
          <p className="text-muted-foreground text-sm pt-0 !mt-0">Select the application theme.</p>
        </div>

        <RadioGroup className="grid max-w-md grid-cols-2 gap-8">
          <div className="cursor-pointer" onClick={() => setTheme(ApplicationTheme.Light)}>
            <div
              className={cn(
                'items-center rounded-md border-2 p-1',
                theme === ApplicationTheme.Light ? 'border-foreground' : 'border-muted',
              )}
            >
              <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
              </div>
            </div>
            <span className="block w-full text-center text-sm font-medium pt-1">Light</span>
          </div>
          <div className="cursor-pointer" onClick={() => setTheme(ApplicationTheme.Dark)}>
            <div
              className={cn(
                'items-center rounded-md border-2 p-1',
                theme === ApplicationTheme.Dark ? 'border-foreground' : 'border-muted',
              )}
            >
              <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
              </div>
            </div>
            <span className="block w-full text-center text-sm font-medium pt-1">Dark</span>
          </div>
        </RadioGroup>
      </div>

      <div className="flex flex-col space-y-2">
        <div>
          <h3 className="pb-0 mb-0 font-medium">Backup</h3>
          <p className="text-muted-foreground text-sm pt-0 !mt-0">
            Options for backing up your data.
          </p>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" onClick={createBackup}>
            Create Backup
          </Button>
          <Button size="sm" onClick={handleRestoreBackup}>
            Restore Backup
          </Button>
        </div>
        <div className="border rounded-lg p-4 flex flex-col space-y-2">
          <div className="space-y-2 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <span>Automatic backups</span>
              <p className="text-sm text-muted-foreground">Automatically backup your library.</p>
            </div>
            <Switch checked={autoBackup} onCheckedChange={(checked) => setAutoBackup(checked)} />
          </div>
          {autoBackup && (
            <div className="flex items-center space-x-2">
              <span>Create up to</span>
              <Input
                className="max-w-20"
                type="number"
                value={autoBackupCount}
                min={1}
                onChange={(e) => setAutoBackupCount(+e.target.value)}
              />
              <span>daily backups.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
