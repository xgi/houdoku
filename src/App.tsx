import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import log from 'electron-log';
import { ipcRenderer } from 'electron';
import { ExtensionMetadata } from 'houdoku-extension-lib';
import { configuredStore } from './store';
import persistantStore from './util/persistantStore';
import routes from './constants/routes.json';
import DashboardPage from './components/general/DashboardPage';
import ReaderPage from './components/reader/ReaderPage';
import * as database from './util/db';
import ipcChannels from './constants/ipcChannels.json';
import storeKeys from './constants/storeKeys.json';
import { TrackerMetadata } from './models/types';
import { setStatusText } from './features/statusbar/actions';
import { loadSeriesList } from './features/library/utils';
import { linkDownloaderClientFunctions } from './features/downloader/reducers';

const store = configuredStore();

log.debug('Performing database init and loading series list');
database
  .init()
  .then(() => {
    return loadSeriesList(store.dispatch);
  })
  .catch((error) => log.error(error));

const loadStoredExtensionSettings = () => {
  log.info('Loading stored extension settings...');
  return (
    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.GET_ALL)
      // eslint-disable-next-line promise/always-return
      .then((metadataList: ExtensionMetadata[]) => {
        metadataList.forEach((metadata: ExtensionMetadata) => {
          const extSettings: string | null = persistantStore.read(
            `${storeKeys.EXTENSION_SETTINGS_PREFIX}${metadata.id}`
          );
          if (extSettings !== null) {
            log.debug(`Found stored settings for extension ${metadata.id}`);
            ipcRenderer.invoke(
              ipcChannels.EXTENSION.SET_SETTINGS,
              metadata.id,
              JSON.parse(extSettings)
            );
          }
        });
      })
      .catch((e: Error) => log.error(e))
  );
};

const loadStoredTrackerTokens = () => {
  log.info('Loading stored tracker tokens...');
  return (
    ipcRenderer
      .invoke(ipcChannels.TRACKER_MANAGER.GET_ALL)
      // eslint-disable-next-line promise/always-return
      .then((metadataList: TrackerMetadata[]) => {
        metadataList.forEach((metadata: TrackerMetadata) => {
          const token: string | null = persistantStore.read(
            `${storeKeys.TRACKER_ACCESS_TOKEN_PREFIX}${metadata.id}`
          );
          if (token !== null) {
            log.debug(`Found stored token for tracker ${metadata.id}`);
            ipcRenderer.invoke(
              ipcChannels.TRACKER.SET_ACCESS_TOKEN,
              metadata.id,
              token
            );
          }
        });
      })
      .catch((e: Error) => log.error(e))
  );
};

loadStoredExtensionSettings();
loadStoredTrackerTokens();

log.debug('Adding app-wide renderer IPC handlers');
ipcRenderer.on(ipcChannels.APP.LOAD_STORED_EXTENSION_SETTINGS, () => {
  loadStoredExtensionSettings();
});
ipcRenderer.on(ipcChannels.APP.SET_STATUS, (_event, text) => {
  store.dispatch(setStatusText(text));
});

if (store.getState().settings.autoCheckForUpdates) {
  ipcRenderer.invoke(ipcChannels.APP.CHECK_FOR_UPDATES);
} else {
  log.debug('Skipping update check, autoCheckForUpdates is disabled');
}

// the downloader requires access to some other actions/parts of the
// state, so they are manually linked here
linkDownloaderClientFunctions(store);

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route
            path={`${routes.READER}/:chapter_id`}
            exact
            component={ReaderPage}
          />
          <Route path={routes.SERIES} component={DashboardPage} />
          <Route path={routes.SEARCH} component={DashboardPage} />
          <Route path={routes.SETTINGS} component={DashboardPage} />
          <Route path={routes.LIBRARY} component={DashboardPage} />
        </Switch>
      </Router>
    </Provider>
  );
}
