const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';
import packageJson from '../../package.json';

/**
 * Apply listeners to window-operation buttons.
 * This function accesses buttons defined in index.html and associates them with IPC-handled tasks.
 * See main.dev.ts for the actual functions of these buttons.
 */
export async function createWindowControlListeners() {
  console.debug(`Creating window control listeners...`);
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

export const updateTitlebarText = (text?: string) => {
  const titleElement = document.getElementById('window-title-text');
  if (titleElement) {
    titleElement.innerHTML = text
      ? `${packageJson.productName} - ${text}`
      : packageJson.productName;
    console.debug(`Updated titlebar with '${text}'`);
  } else {
    console.debug("Tried to update titlebar text, but couldn't find element");
  }
};
