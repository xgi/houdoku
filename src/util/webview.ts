import { BrowserWindow } from 'electron';
import { WebviewResponse } from 'houdoku-extension-lib';

// eslint-disable-next-line import/prefer-default-export
export const loadInWebView = (
  spoofWindow: BrowserWindow | null,
  url: string,
  options?: Electron.LoadURLOptions
): Promise<WebviewResponse> => {
  if (spoofWindow === null) {
    return new Promise<WebviewResponse>((_resolve, reject) =>
      reject(
        new Error('Tried to load URL in webview but spoof window was null')
      )
    );
  }

  return new Promise<WebviewResponse>((resolve, reject) => {
    const handleFrame = async (finishedLoad = false) => {
      const cookies = await spoofWindow.webContents.session.cookies.get({});
      const hasClearanceCookie =
        cookies.filter((cookie) => cookie.name === 'cf_clearance').length > 0;

      if (
        spoofWindow.webContents.getTitle().includes('Just a moment...') &&
        !hasClearanceCookie
      ) {
        return;
      }

      spoofWindow?.webContents
        .executeJavaScript('document.body.innerHTML')
        // eslint-disable-next-line promise/always-return
        .then((value) => {
          const pageUrl = spoofWindow.webContents.getURL();
          const pageTitle = spoofWindow.webContents.getTitle();

          spoofWindow.webContents.setBackgroundThrottling(true);
          resolve({ text: value, url: pageUrl, title: pageTitle });
        });
    };

    spoofWindow.webContents.removeAllListeners('did-frame-finish-load');
    spoofWindow.webContents.on('did-frame-finish-load', () => handleFrame());

    spoofWindow.webContents.setBackgroundThrottling(false);
    // eslint-disable-next-line promise/catch-or-return
    spoofWindow.loadURL(url, options).then(() => handleFrame(true));
  });
};
