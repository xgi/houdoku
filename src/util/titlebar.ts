import { ipcRenderer } from 'electron';
import ipcChannels from '../constants/ipcChannels.json';

/**
 * Apply listeners to window-operation buttons.
 * This function accesses buttons defined in index.html and associates them with IPC-handled tasks.
 * See main.dev.ts for the actual functions of these buttons.
 */
export default async function createWindowControlListeners() {
  const minButton = document.getElementById('min-button');
  const maxRestoreButton = document.getElementById('max-restore-button');
  const closeButton = document.getElementById('close-button');

  if (minButton != null) {
    minButton.addEventListener('click', () => {
      ipcRenderer.invoke(ipcChannels.WINDOW.MINIMIZE);
    });
  }

  if (maxRestoreButton != null) {
    maxRestoreButton.addEventListener('click', () => {
      ipcRenderer.invoke(ipcChannels.WINDOW.MAX_RESTORE);
    });
  }

  if (closeButton != null) {
    closeButton.addEventListener('click', () => {
      ipcRenderer.invoke(ipcChannels.WINDOW.CLOSE);
    });
  }
}
