import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
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
import { reloadSeriesList } from '../../features/library/utils';
import Settings from '../settings/Settings';
import About from '../about/About';
import Library from '../library/Library';
import Extensions from '../extensions/Extensions';
import Downloads from '../downloads/Downloads';
import {
  completedStartReloadState,
  reloadingSeriesListState,
  seriesListState,
} from '../../state/libraryStates';
import library from '../../services/library';
import { statusTextState } from '../../state/statusBarStates';
import { chapterLanguagesState, refreshOnStartState } from '../../state/settingStates';
import DashboardSidebarLink from './DashboardSidebarLink';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

const DashboardPage: React.FC<Props> = (props: Props) => {
  const [seriesList, setSeriesList] = useRecoilState(seriesListState);
  const [, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const [completedStartReload, setCompletedStartReload] = useRecoilState(completedStartReloadState);
  const setStatusText = useSetRecoilState(statusTextState);
  const refreshOnStart = useRecoilValue(refreshOnStartState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);

  useEffect(() => {
    if (refreshOnStart && !completedStartReload && seriesList.length > 0) {
      setReloadingSeriesList(true);
      reloadSeriesList(
        library.fetchSeriesList(),
        setSeriesList,
        setReloadingSeriesList,
        setStatusText,
        chapterLanguages
      )
        // eslint-disable-next-line promise/always-return
        .then(() => {
          setCompletedStartReload(true);
        })
        .catch((e) => log.error(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesList]);

  return (
    <AppShell
      padding="md"
      navbar={
        <Navbar width={{ base: 200 }} p="xs">
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
              icon={<IconSettings size={16} />}
              color="blue"
              label="Settings"
              route={routes.SETTINGS}
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
      <Switch>
        <Route path={`${routes.SERIES}/:id`} exact>
          <SeriesDetails />
        </Route>
        <Route path={routes.SETTINGS} exact>
          <Settings />
        </Route>
        <Route path={routes.ABOUT} exact>
          <About />
        </Route>
        <Route path={routes.SEARCH} exact>
          <Search />
        </Route>
        <Route path={routes.EXTENSIONS} exact>
          <Extensions />
        </Route>
        <Route path={routes.DOWNLOADS} exact>
          <Downloads />
        </Route>
        <Route path={routes.LIBRARY}>
          <Library />
        </Route>
      </Switch>
    </AppShell>
  );
};

export default DashboardPage;
