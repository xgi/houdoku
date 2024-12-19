const { ipcRenderer } = require('electron');
import { ExtensionMetadata } from '@tiyo/common';
import persistantStore from '@/renderer/util/persistantStore';
import ipcChannels from '@/common/constants/ipcChannels.json';
import storeKeys from '@/common/constants/storeKeys.json';
import { TrackerMetadata } from '@/common/models/types';
import { UpdateInfo } from 'electron-updater';
import { toast } from '@houdoku/ui/hooks/use-toast';

export const loadStoredExtensionSettings = () => {
  console.info('Loading stored extension settings...');
  return ipcRenderer
    .invoke(ipcChannels.EXTENSION_MANAGER.GET_ALL)
    .then((metadataList: ExtensionMetadata[]) => {
      metadataList.forEach((metadata: ExtensionMetadata) => {
        const extSettings: string | null = persistantStore.read(
          `${storeKeys.EXTENSION_SETTINGS_PREFIX}${metadata.id}`,
        );
        if (extSettings !== null && extSettings !== 'undefined') {
          console.debug(`Found stored settings for extension ${metadata.id}`);
          ipcRenderer.invoke(
            ipcChannels.EXTENSION.SET_SETTINGS,
            metadata.id,
            JSON.parse(extSettings),
          );
        }
      });
    })
    .catch((e: Error) => console.error(e));
};

export const loadStoredTrackerTokens = () => {
  console.info('Loading stored tracker tokens...');
  return ipcRenderer
    .invoke(ipcChannels.TRACKER_MANAGER.GET_ALL)
    .then((metadataList: TrackerMetadata[]) => {
      metadataList.forEach((metadata: TrackerMetadata) => {
        const token: string | null = persistantStore.read(
          `${storeKeys.TRACKER_ACCESS_TOKEN_PREFIX}${metadata.id}`,
        );
        if (token !== null) {
          console.debug(`Found stored token for tracker ${metadata.id}`);
          ipcRenderer.invoke(ipcChannels.TRACKER.SET_ACCESS_TOKEN, metadata.id, token);
        }
      });
    })
    .catch((e: Error) => console.error(e));
};

export const createRendererIpcHandlers = (
  showUpdateAvailableDialog: (updateInfo: UpdateInfo) => void,
  showUpdateDownloadedDialog: () => void,
) => {
  console.debug('Creating renderer IPC handlers...');

  ipcRenderer.on(ipcChannels.APP.LOAD_STORED_EXTENSION_SETTINGS, () => {
    loadStoredExtensionSettings();
  });
  ipcRenderer.on(ipcChannels.WINDOW.SET_FULLSCREEN, (_event, fullscreen) => {
    if (fullscreen) {
      document.getElementById('titlebar')?.classList.add('hidden');
    } else {
      document.getElementById('titlebar')?.classList.remove('hidden');
    }
  });

  ipcRenderer.on(
    ipcChannels.APP.SEND_NOTIFICATION,
    (_event, title?: string, description?: string) => {
      console.info(`Sending toast: ${title} - ${description}`);
      toast({ title, description, duration: 5000 });
    },
  );

  ipcRenderer.on(ipcChannels.APP.SHOW_PERFORM_UPDATE_DIALOG, (_event, updateInfo: UpdateInfo) => {
    showUpdateAvailableDialog(updateInfo);
  });

  ipcRenderer.on(ipcChannels.APP.SHOW_RESTART_UPDATE_DIALOG, () => {
    showUpdateDownloadedDialog();
  });
};
