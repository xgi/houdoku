import { BrowserView, BrowserWindow } from 'electron';
import { WebviewResponse } from 'houdoku-extension-lib';

// eslint-disable-next-line import/prefer-default-export
export const loadInWebView = (
  window: BrowserWindow | null,
  url: string
): Promise<WebviewResponse> => {
  if (window !== null) {
    const spoofView = new BrowserView({
      webPreferences: {
        images: false,
      },
    });
    window.setBrowserView(spoofView);
    spoofView.setBounds({ x: 0, y: 200, width: 500, height: 500 });

    spoofView.webContents.loadURL(url);
    return new Promise<WebviewResponse>((resolve, reject) => {
      if (spoofView === null)
        reject(new Error('Failed to setup new BrowserView to load URL'));
      else {
        const handler = (lastChance: boolean) => {
          if (spoofView.webContents.getTitle().includes('Just a moment...')) {
            if (lastChance)
              reject(
                new Error(
                  'BrowserView page finished loading but did not bypass Cloudflare'
                )
              );
            return;
          }

          spoofView?.webContents
            .executeJavaScript('document.body.innerHTML')
            .then((value) => {
              const pageUrl = spoofView.webContents.getURL();
              const pageTitle = spoofView.webContents.getTitle();

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (spoofView as any).webContents.destroy();
              // eslint-disable-next-line promise/always-return
              window?.removeBrowserView(spoofView);
              resolve({ text: value, url: pageUrl, title: pageTitle });
            });
        };

        spoofView.webContents.on('did-frame-finish-load', () => handler(false));
        spoofView.webContents.once('did-finish-load', () => handler(true));
      }
    });
  }

  return new Promise<WebviewResponse>((resolve, reject) =>
    reject(new Error('Tried to load URL in a BrowserView, but window was null'))
  );
};
