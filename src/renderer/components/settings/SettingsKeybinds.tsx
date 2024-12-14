import React from 'react';
import { SetterOrUpdater, useRecoilState } from 'recoil';
import { DefaultSettings, ReaderSetting } from '@/common/models/types';
import {
  keyChapterLeftState,
  keyChapterRightState,
  keyCloseOrBackState,
  keyExitState,
  keyFirstPageState,
  keyLastPageState,
  keyPageLeftState,
  keyPageRightState,
  keyToggleFullscreenState,
  keyToggleOffsetDoubleSpreadsState,
  keyTogglePageStyleState,
  keyToggleReadingDirectionState,
  keyToggleShowingHeaderState,
  keyToggleShowingScrollbarState,
  keyToggleShowingSettingsModalState,
} from '@/renderer/state/settingStates';
import { Button } from '@/ui/components/Button';

export const SettingsKeybinds: React.FC = () => {
  const keyPageLeftTuple = useRecoilState(keyPageLeftState);
  const keyFirstPageTuple = useRecoilState(keyFirstPageState);
  const keyPageRightTuple = useRecoilState(keyPageRightState);
  const keyLastPageTuple = useRecoilState(keyLastPageState);
  const keyChapterLeftTuple = useRecoilState(keyChapterLeftState);
  const keyChapterRightTuple = useRecoilState(keyChapterRightState);
  const keyToggleReadingDirectionTuple = useRecoilState(keyToggleReadingDirectionState);
  const keyTogglePageStyleTuple = useRecoilState(keyTogglePageStyleState);
  const keyToggleOffsetDoubleSpreadsTuple = useRecoilState(keyToggleOffsetDoubleSpreadsState);
  const keyToggleShowingSettingsModalTuple = useRecoilState(keyToggleShowingSettingsModalState);
  const keyToggleShowingScrollbarTuple = useRecoilState(keyToggleShowingScrollbarState);
  const keyToggleShowingHeaderTuple = useRecoilState(keyToggleShowingHeaderState);
  const keyToggleFullscreenTuple = useRecoilState(keyToggleFullscreenState);
  const keyExitTuple = useRecoilState(keyExitState);
  const keyCloseOrBackTuple = useRecoilState(keyCloseOrBackState);

  const updateKeySetting = (e: React.KeyboardEvent, setter: SetterOrUpdater<string>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!['Control', 'Shift', 'Meta', 'Command', 'Alt', 'Option'].includes(e.key)) {
      const metaStr = `${e.metaKey ? 'meta+' : ''}`;
      const ctrlStr = `${e.ctrlKey ? 'ctrl+' : ''}`;
      const altStr = `${e.altKey ? 'alt+' : ''}`;
      const shiftStr = `${e.shiftKey ? 'shift+' : ''}`;

      const key = e.key
        .toLowerCase()
        .replace('arrow', '')
        .replace('insert', 'ins')
        .replace('delete', 'del')
        .replace(' ', 'space')
        .replace('+', 'plus');

      const keyStr = `${metaStr}${ctrlStr}${altStr}${shiftStr}${key}`;
      setter(keyStr);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-1">
        {[
          {
            name: 'Turn page right',
            stateTuple: keyPageRightTuple,
            setting: ReaderSetting.KeyPageRight,
          },
          {
            name: 'Turn page left',
            stateTuple: keyPageLeftTuple,
            setting: ReaderSetting.KeyPageLeft,
          },
          {
            name: 'First page',
            stateTuple: keyFirstPageTuple,
            setting: ReaderSetting.KeyFirstPage,
          },
          {
            name: 'Last page',
            stateTuple: keyLastPageTuple,
            setting: ReaderSetting.KeyLastPage,
          },
          {
            name: 'Change chapter right',
            stateTuple: keyChapterRightTuple,
            setting: ReaderSetting.KeyChapterRight,
          },
          {
            name: 'Change chapter left',
            stateTuple: keyChapterLeftTuple,
            setting: ReaderSetting.KeyChapterLeft,
          },
          {
            name: 'Exit reader',
            stateTuple: keyExitTuple,
            setting: ReaderSetting.KeyExit,
          },
          {
            name: 'Close',
            stateTuple: keyCloseOrBackTuple,
            setting: ReaderSetting.KeyCloseOrBack,
          },
          {
            name: 'Toggle reading direction',
            stateTuple: keyToggleReadingDirectionTuple,
            setting: ReaderSetting.KeyToggleReadingDirection,
          },
          {
            name: 'Toggle page style',
            stateTuple: keyTogglePageStyleTuple,
            setting: ReaderSetting.KeyTogglePageStyle,
          },
          {
            name: 'Toggle double page offset',
            stateTuple: keyToggleOffsetDoubleSpreadsTuple,
            setting: ReaderSetting.KeyToggleOffsetDoubleSpreads,
          },
          {
            name: 'Toggle fullscreen',
            stateTuple: keyToggleFullscreenTuple,
            setting: ReaderSetting.KeyToggleFullscreen,
          },
          {
            name: 'Show settings menu',
            stateTuple: keyToggleShowingSettingsModalTuple,
            setting: ReaderSetting.KeyToggleShowingSettingsModal,
          },
          {
            name: 'Toggle scrollbar',
            stateTuple: keyToggleShowingScrollbarTuple,
            setting: ReaderSetting.KeyToggleShowingScrollbar,
          },
          {
            name: 'Toggle menu bar',
            stateTuple: keyToggleShowingHeaderTuple,
            setting: ReaderSetting.KeyToggleShowingHeader,
          },
        ].map((entry) => (
          <div className="flex space-x-2 items-center">
            <Button
              size="sm"
              className="w-28 justify-center font-semibold"
              onKeyDownCapture={(e: React.KeyboardEvent) =>
                updateKeySetting(e, entry.stateTuple[1])
              }
            >
              {entry.stateTuple[0]}
            </Button>
            <Button
              size="sm"
              variant={'secondary'}
              className="font-medium"
              disabled={entry.stateTuple[0] === DefaultSettings[entry.setting]}
              onClick={() => entry.stateTuple[1](DefaultSettings[entry.setting] as string)}
            >
              Reset
            </Button>
            <span className="text-sm font-normal">{entry.name}</span>
          </div>
        ))}
      </div>
    </>
  );
};
