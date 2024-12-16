import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
const { ipcRenderer } = require('electron');
import { useRecoilValue, useSetRecoilState } from 'recoil';
import routes from '@/common/constants/routes.json';
import DashboardPage from './components/general/DashboardPage';
import ReaderPage from './components/reader/ReaderPage';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { migrateSeriesTags } from './features/library/utils';
import AppLoading from './components/general/AppLoading';
import { Toaster } from '@/ui/components/Toaster';
import { categoryListState, seriesListState } from './state/libraryStates';
import { downloaderClient } from './services/downloader';
import {
  currentTaskState,
  downloadErrorsState,
  queueState,
  runningState,
} from './state/downloaderStates';
import { autoCheckForUpdatesState } from './state/settingStates';
import library from './services/library';
import {
  createRendererIpcHandlers,
  loadStoredExtensionSettings,
  loadStoredTrackerTokens,
} from './services/ipc';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/components/AlertDialog';
import { UpdateInfo } from 'electron-updater';

loadStoredExtensionSettings();
loadStoredTrackerTokens();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | undefined>(undefined);
  const [showUpdateAvailableDialog, setShowUpdateAvailableDialog] = useState(false);
  const [showUpdateDownloadedDialog, setShowUpdateDownloadedDialog] = useState(false);
  const setSeriesList = useSetRecoilState(seriesListState);
  const setCategoryList = useSetRecoilState(categoryListState);
  const setRunning = useSetRecoilState(runningState);
  const setQueue = useSetRecoilState(queueState);
  const setCurrentTask = useSetRecoilState(currentTaskState);
  const setDownloadErrors = useSetRecoilState(downloadErrorsState);
  const autoCheckForUpdates = useRecoilValue(autoCheckForUpdatesState);

  useEffect(() => {
    if (loading) {
      console.debug('Performing initial app load steps');

      /**
       * Add any additional preload steps here (e.g. data migration, verifications, etc)
       */

      createRendererIpcHandlers(
        (updateInfo) => {
          setUpdateInfo(updateInfo);
          setShowUpdateAvailableDialog(true);
        },
        () => setShowUpdateDownloadedDialog(true),
      );

      // Give the downloader client access to the state modifiers
      downloaderClient.setStateFunctions(setRunning, setQueue, setCurrentTask, setDownloadErrors);

      // TODO add reloader client

      // Previously the series object had separate tag fields (themes, formats, genres,
      // demographic, content warnings). These have now been consolidated into the
      // field 'tags'.
      migrateSeriesTags();

      // Remove any preview series.
      library
        .fetchSeriesList()
        .filter((series) => series.preview)
        .forEach((series) => (series.id ? library.removeSeries(series.id, false) : undefined));

      // If AutoCheckForUpdates setting is enabled, check for client updates now
      if (autoCheckForUpdates) {
        ipcRenderer.invoke(ipcChannels.APP.CHECK_FOR_UPDATES);
      } else {
        console.debug('Skipping update check, autoCheckForUpdates is disabled');
      }

      setSeriesList(library.fetchSeriesList());
      setCategoryList(library.fetchCategoryList());
      setLoading(false);
    }
  }, [loading]);

  return (
    <>
      <Toaster />

      <AlertDialog open={showUpdateAvailableDialog} onOpenChange={setShowUpdateAvailableDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Update available</AlertDialogTitle>
            {updateInfo && (
              <AlertDialogDescription>
                Houdoku v{updateInfo?.version} was released on{' '}
                {new Date(updateInfo.releaseDate).toLocaleDateString()}.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={() => ipcRenderer.invoke(ipcChannels.APP.PERFORM_UPDATE)}>
              Download update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUpdateDownloadedDialog} onOpenChange={setShowUpdateDownloadedDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Restart required</AlertDialogTitle>
            {updateInfo && (
              <AlertDialogDescription>
                Houdoku needs to restart to finish installing updates.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => ipcRenderer.invoke(ipcChannels.APP.UPDATE_AND_RESTART)}
            >
              Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {loading ? (
        <AppLoading />
      ) : (
        <Router>
          <Routes>
            <Route path={`${routes.READER}/:series_id/:chapter_id`} element={<ReaderPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </Router>
      )}
    </>
  );
}
