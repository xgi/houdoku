import { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
const { ipcRenderer } = require("electron");
import { useRecoilValue, useSetRecoilState } from "recoil";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import routes from "@/common/constants/routes.json";
import DashboardPage from "./components/general/DashboardPage";
import ReaderPage from "./components/reader/ReaderPage";
import ipcChannels from "@/common/constants/ipcChannels.json";
import { migrateSeriesTags } from "./features/library/utils";
import AppLoading from "./components/general/AppLoading";
import { categoryListState, seriesListState } from "./state/libraryStates";
import { downloaderClient } from "./services/downloader";
import {
  currentTaskState,
  downloadErrorsState,
  queueState,
  runningState,
} from "./state/downloaderStates";
import { autoCheckForUpdatesState } from "./state/settingStates";
import library from "./services/library";
import {
  createRendererIpcHandlers,
  loadStoredExtensionSettings,
  loadStoredTrackerTokens,
} from "./services/ipc";

loadStoredExtensionSettings();
loadStoredTrackerTokens();
createRendererIpcHandlers();

export default function App() {
  const [loading, setLoading] = useState(true);
  const setSeriesList = useSetRecoilState(seriesListState);
  const setCategoryList = useSetRecoilState(categoryListState);
  const setRunning = useSetRecoilState(runningState);
  const setQueue = useSetRecoilState(queueState);
  const setCurrentTask = useSetRecoilState(currentTaskState);
  const setDownloadErrors = useSetRecoilState(downloadErrorsState);
  const autoCheckForUpdates = useRecoilValue(autoCheckForUpdatesState);

  useEffect(() => {
    if (loading) {
      console.debug("Performing initial app load steps");

      /**
       * Add any additional preload steps here (e.g. data migration, verifications, etc)
       */

      // Give the downloader client access to the state modifiers
      downloaderClient.setStateFunctions(setRunning, setQueue, setCurrentTask, setDownloadErrors);

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
        console.debug("Skipping update check, autoCheckForUpdates is disabled");
      }

      setSeriesList(library.fetchSeriesList());
      setCategoryList(library.fetchCategoryList());
      setLoading(false);
    }
  }, [loading]);

  return (
    <>
      <Notifications />
      <ModalsProvider>
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
      </ModalsProvider>
    </>
  );
}
