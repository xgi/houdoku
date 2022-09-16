import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import log from 'electron-log';
import { ipcRenderer } from 'electron';
import { ExtensionMetadata } from 'houdoku-extension-lib';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  Box,
  Button,
  ColorScheme,
  ColorSchemeProvider,
  Group,
  List,
  MantineProvider,
  Text,
} from '@mantine/core';
import { closeAllModals, ModalsProvider, openConfirmModal, openModal } from '@mantine/modals';
import {
  NotificationProps,
  NotificationsProvider,
  showNotification,
  updateNotification,
} from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import { UpdateInfo } from 'electron-updater';
import parse from 'html-react-parser';
import persistantStore from './util/persistantStore';
import routes from './constants/routes.json';
import DashboardPage from './components/general/DashboardPage';
import ReaderPage from './components/reader/ReaderPage';
import ipcChannels from './constants/ipcChannels.json';
import storeKeys from './constants/storeKeys.json';
import { TrackerMetadata } from './models/types';
import { loadSeriesList, migrateSeriesTags } from './features/library/utils';
import AppLoading from './components/general/AppLoading';
import { seriesListState } from './state/libraryStates';
import { downloaderClient } from './services/downloader';
import {
  currentTaskState,
  downloadErrorsState,
  queueState,
  runningState,
} from './state/downloaderStates';
import { autoCheckForExtensionUpdatesState, autoCheckForUpdatesState } from './state/settingStates';
import { ErrorBoundary } from './components/general/ErrorBoundary';

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
            ipcRenderer.invoke(ipcChannels.TRACKER.SET_ACCESS_TOKEN, metadata.id, token);
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
ipcRenderer.on(ipcChannels.WINDOW.SET_FULLSCREEN, (_event, fullscreen) => {
  if (fullscreen) {
    document.getElementById('titlebar')?.classList.add('hidden');
  } else {
    document.getElementById('titlebar')?.classList.remove('hidden');
  }
});
ipcRenderer.on(
  ipcChannels.APP.SEND_NOTIFICATION,
  (_event, props: NotificationProps, isUpdate = false, iconName?: 'check' | 'x') => {
    log.info(`Sending notification: ${props}`);
    const iconNode =
      iconName !== undefined
        ? { check: <IconCheck size={16} />, x: <IconX size={16} /> }[iconName]
        : undefined;

    if (isUpdate && props.id !== undefined) {
      updateNotification({ ...props, id: props.id, icon: iconNode });
    } else {
      showNotification({
        ...props,
        icon: iconNode,
      });
    }
  }
);

ipcRenderer.on(ipcChannels.APP.SHOW_PERFORM_UPDATE_DIALOG, (_event, updateInfo: UpdateInfo) => {
  openConfirmModal({
    title: 'Update Available',
    children: (
      <>
        <Text mb="sm">
          Houdoku v{updateInfo.version} was released on{' '}
          {new Date(updateInfo.releaseDate).toLocaleDateString()}.
        </Text>
        <Box
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
          })}
          p="xs"
        >
          <Text size="sm">{parse(updateInfo.releaseNotes as string)}</Text>
        </Box>
      </>
    ),
    labels: { confirm: 'Download Update', cancel: 'Not now' },
    onCancel: () => log.info('User opted not to perform update'),
    onConfirm: () => ipcRenderer.invoke(ipcChannels.APP.PERFORM_UPDATE),
  });
});

ipcRenderer.on(ipcChannels.APP.SHOW_RESTART_UPDATE_DIALOG, () => {
  openConfirmModal({
    title: 'Restart Required',
    children: <Text>Houdoku needs to restart to finish installing updates. Restart now?</Text>,
    labels: { confirm: 'Restart Now', cancel: 'Later' },
    onCancel: () => log.info('User opted not to restart to update'),
    onConfirm: () => ipcRenderer.invoke(ipcChannels.APP.UPDATE_AND_RESTART),
  });
});

export default function App() {
  const [loading, setLoading] = useState(true);
  const setSeriesList = useSetRecoilState(seriesListState);
  const setRunning = useSetRecoilState(runningState);
  const setQueue = useSetRecoilState(queueState);
  const setCurrentTask = useSetRecoilState(currentTaskState);
  const setDownloadErrors = useSetRecoilState(downloadErrorsState);
  const autoCheckForUpdates = useRecoilValue(autoCheckForUpdatesState);
  const autoCheckForExtensionUpdates = useRecoilValue(autoCheckForExtensionUpdatesState);

  const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (loading) {
      log.debug('Performing initial app load steps');

      /**
       * Add any additional preload steps here (e.g. data migration, verifications, etc)
       */

      // Give the downloader client access to the state modifiers
      downloaderClient.setStateFunctions(setRunning, setQueue, setCurrentTask, setDownloadErrors);

      // Previously the series object had separate tag fields (themes, formats, genres,
      // demographic, content warnings). These have now been consolidated into the
      // field 'tags'.
      migrateSeriesTags();

      // If AutoCheckForUpdates setting is enabled, check for client updates now
      if (autoCheckForUpdates) {
        ipcRenderer.invoke(ipcChannels.APP.CHECK_FOR_UPDATES);
      } else {
        log.debug('Skipping update check, autoCheckForUpdates is disabled');
      }

      // If AutoCheckForExtensionUpdates setting is enabled, check for extension updates now
      if (autoCheckForExtensionUpdates) {
        ipcRenderer
          .invoke(ipcChannels.EXTENSION_MANAGER.CHECK_FOR_UPDATESS)
          .then(
            (updates: {
              [key: string]: {
                metadata: ExtensionMetadata;
                newVersion: string;
              };
            }) => {
              // eslint-disable-next-line promise/always-return
              if (Object.values(updates).length > 0) {
                openModal({
                  title: 'Extension Updates Available',
                  children: (
                    <>
                      <List pb="sm">
                        {Object.values(updates).map((update) => (
                          <List.Item key={update.metadata.id}>
                            {update.metadata.name} ({update.metadata.version}→{update.newVersion})
                          </List.Item>
                        ))}
                      </List>
                      <Text>
                        Please go to the Extensions tab to update. You can disable this message in
                        the settings.
                      </Text>
                      <Group position="right">
                        <Button variant="default" onClick={() => closeAllModals()} mt="md">
                          Okay
                        </Button>
                      </Group>
                    </>
                  ),
                });
              }
            }
          )
          .catch((err: Error) => log.error(err));
      } else {
        log.debug('Skipping extension update check, autoCheckForExtensionUpdates is disabled');
      }

      loadSeriesList(setSeriesList);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        <ErrorBoundary>
          <ModalsProvider>
            <NotificationsProvider>
              {loading ? (
                <AppLoading />
              ) : (
                <Router>
                  <Switch>
                    <Route
                      path={`${routes.READER}/:series_id/:chapter_id`}
                      exact
                      component={ReaderPage}
                    />
                    <Route path={routes.SERIES} component={DashboardPage} />
                    <Route path={routes.SEARCH} component={DashboardPage} />
                    <Route path={routes.SETTINGS} component={DashboardPage} />
                    <Route path={routes.LIBRARY} component={DashboardPage} />
                  </Switch>
                </Router>
              )}
            </NotificationsProvider>
          </ModalsProvider>
        </ErrorBoundary>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
