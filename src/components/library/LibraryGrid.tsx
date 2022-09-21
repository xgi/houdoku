import fs from 'fs';
import path from 'path';
import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import { Series } from 'houdoku-extension-lib';
import { Overlay, SimpleGrid, Title } from '@mantine/core';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import blankCover from '../../img/blank_cover.png';
import ipcChannels from '../../constants/ipcChannels.json';
import constants from '../../constants/constants.json';
import LibraryGridContextMenu from './LibraryGridContextMenu';
import styles from './LibraryGrid.css';
import { seriesListState } from '../../state/libraryStates';
import { libraryColumnsState } from '../../state/settingStates';
import { goToSeries } from '../../features/library/utils';
import ExtensionImage from '../general/ExtensionImage';

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  getFilteredList: () => Series[];
  showRemoveModal: (series: Series) => void;
};

const LibraryGrid: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const setSeriesList = useSetRecoilState(seriesListState);
  const libraryColumns = useRecoilValue(libraryColumnsState);
  const [showingContextMenu, setShowingContextMenu] = useState(false);
  const [contextMenuSeries, setContextMenuSeries] = useState<Series | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const viewFunc = (series: Series) => {
    goToSeries(series, setSeriesList, navigate);
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
          style={{ zIndex: 10 }}
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
        {props.getFilteredList().map((series: Series) => {
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
                height: `calc(105vw / ${libraryColumns})`,
              }}
            >
              <Overlay
                gradient="linear-gradient(0deg, #000000cc, #00000000 40%, #00000000)"
                zIndex={5}
              />
              <ExtensionImage
                url={coverSource}
                series={series}
                alt={series.title}
                width="100%"
                height="100%"
              />
              {renderUnreadBadge(series)}
              <Title
                className={styles.seriesTitle}
                order={5}
                lineClamp={3}
                p={4}
                style={{ zIndex: 10 }}
              >
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
