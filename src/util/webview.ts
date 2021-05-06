import { BrowserView, BrowserWindow } from 'electron';

// eslint-disable-next-line import/prefer-default-export
export const loadInWebView = (window: BrowserWindow | null, url: string) => {
  if (window !== null) {
    const spoofView = new BrowserView();
    window.setBrowserView(spoofView);
    spoofView.setBounds({ x: 0, y: 0, width: 0, height: 0 });

    spoofView.webContents.loadURL(url);
    return new Promise<string>((resolve, reject) => {
      if (spoofView === null) reject();
      else {
        spoofView.webContents.once('did-frame-finish-load', () => {
          spoofView?.webContents
            .executeJavaScript('document.body.innerHTML')
            .then((value) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (spoofView as any).webContents.destroy();
              // eslint-disable-next-line promise/always-return
              window?.removeBrowserView(spoofView);
              resolve(value);
            });
        });
      }
    });
  }

  return new Promise((resolve, reject) => reject());
};
