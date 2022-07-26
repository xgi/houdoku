import { BrowserWindow } from 'electron';
import { WebviewResponse } from 'houdoku-extension-lib';

// eslint-disable-next-line import/prefer-default-export
export const loadInWebView = async (
  spoofWindow: BrowserWindow | null,
  url: string,
  options?: Electron.LoadURLOptions
): Promise<WebviewResponse> => {
  if (spoofWindow === null) {
    return new Promise<WebviewResponse>((_resolve, reject) =>
      reject(new Error('Tried to load URL in webview but spoof window was null'))
    );
  }

  return new Promise<WebviewResponse>((resolve, reject) => {
    const handleFrame = async () => {
      const cookies = await spoofWindow.webContents.session.cookies.get({});
      const hasClearanceCookie =
        cookies.filter((cookie) => cookie.name === 'cf_clearance').length > 0;

      if (spoofWindow.webContents.getTitle().includes('Just a moment...') && !hasClearanceCookie) {
        return;
      }

      spoofWindow?.webContents.executeJavaScript('document.body.innerHTML').then((value) => {
        // eslint-disable-next-line promise/always-return
        if (value) {
          const pageUrl = spoofWindow.webContents.getURL();
          const pageTitle = spoofWindow.webContents.getTitle();

          resolve({ text: value, url: pageUrl, title: pageTitle });
        } else {
          reject(new Error('Finished loading page, but it has no content'));
        }
      });
    };

    spoofWindow.webContents.removeAllListeners('did-finish-load');
    spoofWindow.webContents.on('did-finish-load', () => handleFrame());

    spoofWindow.webContents.setBackgroundThrottling(false);
    spoofWindow.loadURL(url, options);
  }).then(async (response) => {
    spoofWindow.webContents.stop();
    spoofWindow.webContents.setBackgroundThrottling(true);
    await spoofWindow.webContents.executeJavaScript('document.body.innerHTML = ""');
    return response;
  });
};
