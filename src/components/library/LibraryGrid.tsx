import fs from 'fs';
import path from 'path';
import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import { Series } from 'houdoku-extension-lib';
import { SimpleGrid, Title } from '@mantine/core';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useHistory } from 'react-router-dom';
import { LibrarySort, ProgressFilter } from '../../models/types';
import blankCover from '../../img/blank_cover.png';
import ipcChannels from '../../constants/ipcChannels.json';
import constants from '../../constants/constants.json';
import LibraryGridContextMenu from './LibraryGridContextMenu';
import styles from './LibraryGrid.css';
import { seriesListState, filterState } from '../../state/libraryStates';
import {
  libraryFilterStatusState,
  libraryFilterProgressState,
  libraryColumnsState,
  librarySortState,
} from '../../state/settingStates';
import { goToSeries } from '../../features/library/utils';

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  showRemoveModal: (series: Series) => void;
};

const LibraryGrid: React.FC<Props> = (props: Props) => {
  const history = useHistory();
  const [seriesList, setSeriesList] = useRecoilState(seriesListState);
  const filter = useRecoilValue(filterState);
  const libraryFilterStatus = useRecoilValue(libraryFilterStatusState);
  const libraryFilterProgress = useRecoilValue(libraryFilterProgressState);
  const libraryColumns = useRecoilValue(libraryColumnsState);
  const librarySort = useRecoilValue(librarySortState);
  const [showingContextMenu, setShowingContextMenu] = useState(false);
  const [contextMenuSeries, setContextMenuSeries] = useState<Series | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const viewFunc = (series: Series) => {
    goToSeries(series, setSeriesList, history);
  };

  /**
   * Get the cover image source of a series.
   * If the series id is non-undefined (i.e. it is in the user's library) we first try to find the
   * downloaded thumbnail image. If it doesn't exist, we return the blankCover path.
   * @param series
   * @returns the cover image for a series, which can be put in an <img> tag
   */
  const getImageSource = (series: Series) => {
    if (series.id !== undefined) {
      const fileExtensions = constants.IMAGE_EXTENSIONS;
      for (let i = 0; i < fileExtensions.length; i += 1) {
        const thumbnailPath = path.join(thumbnailsDir, `${series.id}.${fileExtensions[i]}`);
        if (fs.existsSync(thumbnailPath)) return thumbnailPath;
      }
      return blankCover;
    }

    return series.remoteCoverUrl === '' ? blankCover : series.remoteCoverUrl;
  };

  /**
   * Get a filtered (and sorted) list of series after applying the specified filters.
   * @param seriesList the list of series to filter
   * @returns a sorted list of series matching all filter props
   */
  const getFilteredList = (): Series[] => {
    const filteredList = seriesList.filter((series: Series) => {
      if (!series) return false;

      if (!series.title.toLowerCase().includes(filter.toLowerCase())) return false;
      if (libraryFilterStatus !== null && series.status !== libraryFilterStatus) {
        return false;
      }
      if (libraryFilterProgress === ProgressFilter.Unread && series.numberUnread === 0) {
        return false;
      }
      if (libraryFilterProgress === ProgressFilter.Finished && series.numberUnread > 0) {
        return false;
      }

      return true;
    });

    switch (librarySort) {
      case LibrarySort.UnreadAsc:
        return filteredList.sort((a: Series, b: Series) => a.numberUnread - b.numberUnread);
      case LibrarySort.UnreadDesc:
        return filteredList.sort((a: Series, b: Series) => b.numberUnread - a.numberUnread);
      case LibrarySort.TitleAsc:
        return filteredList.sort((a: Series, b: Series) => a.title.localeCompare(b.title));
      case LibrarySort.TitleDesc:
        return filteredList.sort((a: Series, b: Series) => b.title.localeCompare(a.title));
      default:
        return filteredList;
    }
  };

  /**
   * Render the "Unread" badge on a series.
   * This is a number in a red box at the top-left of the cover, showing the number of unread
   * chapters. This is based on series.numberUnread, which is a fairly naive value obtained by
   * subtracting the highest available chapter number by the latest read chapter number (rounded).
   * See comparison.getNumberUnreadChapters for more details.
   * @param series the series to generate the badge for
   * @returns an element to include in the cover container div
   */
  const renderUnreadBadge = (series: Series) => {
    if (series.numberUnread > 0) {
      return (
        <Title
          order={5}
          className={styles.seriesUnreadBadge}
          sx={(theme) => ({ backgroundColor: theme.colors.red[7] })}
          px={4}
        >
          {series.numberUnread}
        </Title>
      );
    }
    return <></>;
  };

  return (
    <>
      <LibraryGridContextMenu
        position={contextMenuPosition}
        series={contextMenuSeries}
        visible={showingContextMenu}
        close={() => setShowingContextMenu(false)}
        showRemoveModal={props.showRemoveModal}
      />

      <SimpleGrid cols={libraryColumns} spacing="xs">
        {getFilteredList().map((series: Series) => {
          const coverSource = getImageSource(series).replaceAll('\\', '/');

          return (
            <div
              key={`${series.id}-${series.title}`}
              className={styles.coverContainer}
              onClick={() => viewFunc(series)}
              onContextMenu={(e) => {
                setContextMenuPosition({ x: e.clientX, y: e.clientY });
                setContextMenuSeries(series);
                setShowingContextMenu(true);
              }}
              style={{
                backgroundImage: `linear-gradient(0deg, #000000cc, #00000000 40%, #00000000), url("${coverSource}")`,
                height: `calc(105vw / ${libraryColumns})`,
              }}
            >
              {renderUnreadBadge(series)}
              <Title className={styles.seriesTitle} order={5} lineClamp={3} p={4}>
                {series.title}
              </Title>
            </div>
          );
        })}
      </SimpleGrid>
    </>
  );
};

export default LibraryGrid;
