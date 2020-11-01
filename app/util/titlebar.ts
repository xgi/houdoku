import { remote } from 'electron';

export default function handleWindowControls() {
  const win = remote.getCurrentWindow();

  const minButton = document.getElementById('min-button');
  const maxRestoreButton = document.getElementById('max-restore-button');
  const closeButton = document.getElementById('close-button');

  if (minButton != null) {
    minButton.addEventListener('click', () => {
      win.minimize();
    });
  }

  if (maxRestoreButton != null) {
    maxRestoreButton.addEventListener('click', () => {
      if (win.isMaximized()) {
        win.restore();
      } else {
        win.maximize();
      }
    });
  }

  if (closeButton != null) {
    closeButton.addEventListener('click', () => {
      win.close();
    });
  }
}
