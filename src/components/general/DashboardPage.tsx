import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import log from 'electron-log';
import {
  IconBooks,
  IconInfoCircle,
  IconDownload,
  IconPuzzle,
  IconSettings,
  IconSquarePlus,
} from '@tabler/icons';
import { AppShell, Navbar } from '@mantine/core';
import SeriesDetails from '../library/SeriesDetails';
import Search from '../search/Search';
import routes from '../../constants/routes.json';
import { importSeries, reloadSeriesList } from '../../features/library/utils';
import Settings from '../settings/Settings';
import About from '../about/About';
import Library from '../library/Library';
import Extensions from '../extensions/Extensions';
import Downloads from '../downloads/Downloads';
import {
  activeSeriesListState,
  categoryListState,
  completedStartReloadState,
  importingState,
  importQueueState,
  reloadingSeriesListState,
  seriesListState,
} from '../../state/libraryStates';
import library from '../../services/library';
import { chapterLanguagesState, refreshOnStartState } from '../../state/settingStates';
import DashboardSidebarLink from './DashboardSidebarLink';
import { downloadCover } from '../../util/download';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

const DashboardPage: React.FC<Props> = (props: Props) => {
  const setSeriesList = useSetRecoilState(seriesListState);
  const activeSeriesList = useRecoilValue(activeSeriesListState);
  const [, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const [completedStartReload, setCompletedStartReload] = useRecoilState(completedStartReloadState);
  const refreshOnStart = useRecoilValue(refreshOnStartState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const [importQueue, setImportQueue] = useRecoilState(importQueueState);
  const [importing, setImporting] = useRecoilState(importingState);
  const categoryList = useRecoilValue(categoryListState);

  useEffect(() => {
    if (refreshOnStart && !completedStartReload && activeSeriesList.length > 0) {
      setCompletedStartReload(true);
      reloadSeriesList(
        library.fetchSeriesList(),
        setSeriesList,
        setReloadingSeriesList,
        chapterLanguages,
        categoryList
      ).catch((e) => log.error(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        .catch((e) => log.error(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importQueue, importing]);

  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar width={{ base: 200 }} pt={28} p="xs">
          <Navbar.Section grow>
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
              label="Extensions"
              route={routes.EXTENSIONS}
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
          </Navbar.Section>
        </Navbar>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      })}
    >
      <Routes>
        <Route path={`${routes.SERIES}/:id`} element={<SeriesDetails />} />
        <Route path={`${routes.SETTINGS}/*`} element={<Settings />} />
        <Route path={`${routes.ABOUT}/*`} element={<About />} />
        <Route path={`${routes.SEARCH}/*`} element={<Search />} />
        <Route path={`${routes.EXTENSIONS}/*`} element={<Extensions />} />
        <Route path={`${routes.DOWNLOADS}/*`} element={<Downloads />} />
        <Route path="*" element={<Library />} />
      </Routes>
    </AppShell>
  );
};

export default DashboardPage;
