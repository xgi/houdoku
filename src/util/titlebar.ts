import { ipcRenderer } from 'electron';

export default async function createWindowControlListeners() {
  const minButton = document.getElementById('min-button');
  const maxRestoreButton = document.getElementById('max-restore-button');
  const closeButton = document.getElementById('close-button');

  if (minButton != null) {
    minButton.addEventListener('click', () => {
      ipcRenderer.invoke('window-minimize');
    });
  }

  if (maxRestoreButton != null) {
    maxRestoreButton.addEventListener('click', () => {
      ipcRenderer.invoke('window-max-restore');
    });
  }

  if (closeButton != null) {
    closeButton.addEventListener('click', () => {
      ipcRenderer.invoke('window-close');
    });
  }
}
