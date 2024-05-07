import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  IconBooks,
  IconInfoCircle,
  IconDownload,
  IconPuzzle,
  IconSettings,
  IconSquarePlus,
} from '@tabler/icons';
import { AppShell } from '@mantine/core';
import SeriesDetails from '../library/SeriesDetails';
import Search from '../search/Search';
import routes from '@/common/constants/routes.json';
import { importSeries, reloadSeriesList } from '@/renderer/features/library/utils';
import Settings from '../settings/Settings';
import About from '../about/About';
import Library from '../library/Library';
import Plugins from '../plugins/Plugins';
import Downloads from '../downloads/Downloads';
import {
  activeSeriesListState,
  categoryListState,
  completedStartReloadState,
  importingState,
  importQueueState,
  reloadingSeriesListState,
  seriesListState,
} from '@/renderer/state/libraryStates';
import library from '@/renderer/services/library';
import {
  autoBackupCountState,
  autoBackupState,
  chapterLanguagesState,
  refreshOnStartState,
} from '@/renderer/state/settingStates';
import DashboardSidebarLink from './DashboardSidebarLink';
import { downloadCover } from '@/renderer/util/download';
import { createAutoBackup } from '@/renderer/util/backup';

interface Props {}

const DashboardPage: React.FC<Props> = () => {
  const setSeriesList = useSetRecoilState(seriesListState);
  const activeSeriesList = useRecoilValue(activeSeriesListState);
  const [, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const [completedStartReload, setCompletedStartReload] = useRecoilState(completedStartReloadState);
  const refreshOnStart = useRecoilValue(refreshOnStartState);
  const autoBackup = useRecoilValue(autoBackupState);
  const autoBackupCount = useRecoilValue(autoBackupCountState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const [importQueue, setImportQueue] = useRecoilState(importQueueState);
  const [importing, setImporting] = useRecoilState(importingState);
  const categoryList = useRecoilValue(categoryListState);

  useEffect(() => {
    if (autoBackup) {
      createAutoBackup(autoBackupCount);
    }
    if (refreshOnStart && !completedStartReload && activeSeriesList.length > 0) {
      setCompletedStartReload(true);
      reloadSeriesList(
        library.fetchSeriesList(),
        setSeriesList,
        setReloadingSeriesList,
        chapterLanguages,
        categoryList,
      ).catch((e) => console.error(e));
    }
  }, [activeSeriesList]);

  useEffect(() => {
    if (!importing && importQueue.length > 0) {
      setImporting(true);
      const task = importQueue[0];
      setImportQueue(importQueue.slice(1));

      importSeries(task.series, chapterLanguages, task.getFirst)
        .then((addedSeries) => {
          setSeriesList(library.fetchSeriesList());
          setImporting(false);
          if (!task.series.preview) downloadCover(addedSeries);
        })
        .catch((e) => console.error(e));
    }
  }, [importQueue, importing]);

  return (
    <AppShell navbar={{ width: 200, breakpoint: 400 }} padding="md">
      <AppShell.Navbar p="xs" pt={28} bg="dark.8">
        <AppShell.Section grow>
          <DashboardSidebarLink
            icon={<IconBooks size={16} />}
            color="orange"
            label="Library"
            route={routes.LIBRARY}
          />
          <DashboardSidebarLink
            icon={<IconSquarePlus size={16} />}
            color="teal"
            label="Add Series"
            route={routes.SEARCH}
          />
          <DashboardSidebarLink
            icon={<IconPuzzle size={16} />}
            color="grape"
            label="Plugins"
            route={routes.PLUGINS}
          />
          <DashboardSidebarLink
            icon={<IconDownload size={16} />}
            color="red"
            label="Downloads"
            route={routes.DOWNLOADS}
          />
          <DashboardSidebarLink
            icon={<IconSettings size={16} />}
            color="blue"
            label="Settings"
            route={routes.SETTINGS}
          />
          <DashboardSidebarLink
            icon={<IconInfoCircle size={16} />}
            color="yellow"
            label="About"
            route={routes.ABOUT}
          />
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main bg="dark.9" pt={0}>
        <Routes>
          <Route path={`${routes.SERIES}/:id`} element={<SeriesDetails />} />
          <Route path={`${routes.SETTINGS}/*`} element={<Settings />} />
          <Route path={`${routes.ABOUT}/*`} element={<About />} />
          <Route path={`${routes.SEARCH}/*`} element={<Search />} />
          <Route path={`${routes.PLUGINS}/*`} element={<Plugins />} />
          <Route path={`${routes.DOWNLOADS}/*`} element={<Downloads />} />
          <Route path="*" element={<Library />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
};

export default DashboardPage;
