import { BrowserView, BrowserWindow } from 'electron';

// eslint-disable-next-line import/prefer-default-export
export const loadInWebView = (window: BrowserWindow | null, url: string) => {
  if (window !== null) {
    const spoofView = new BrowserView({
      webPreferences: {
        images: false,
      },
    });
    window.setBrowserView(spoofView);
    spoofView.setBounds({ x: 0, y: 0, width: 0, height: 0 });

    spoofView.webContents.loadURL(url);
    return new Promise<string>((resolve, reject) => {
      if (spoofView === null) reject();
      else {
        const handler = (lastChance: boolean) => {
          if (spoofView.webContents.getTitle().includes('Just a moment...')) {
            if (lastChance) reject();
            return;
          }

          spoofView?.webContents
            .executeJavaScript('document.body.innerHTML')
            .then((value) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (spoofView as any).webContents.destroy();
              // eslint-disable-next-line promise/always-return
              window?.removeBrowserView(spoofView);
              resolve(value);
            });
        };

        spoofView.webContents.on('did-frame-finish-load', () => handler(false));
        spoofView.webContents.on('did-finish-load', () => handler(true));
      }
    });
  }

  return new Promise<string>((resolve, reject) =>
    reject(new Error('Tried to load URL in a BrowserView, but window was null'))
  );
};
