const fs = require('fs');
import path from 'path';
import React, { useEffect, useState } from 'react';
const { ipcRenderer } = require('electron');
import { Series } from '@tiyo/common';
import { Overlay, SimpleGrid, Title } from '@mantine/core';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import blankCover from '@/renderer/img/blank_cover.png';
import ipcChannels from '@/common/constants/ipcChannels.json';
import constants from '@/common/constants/constants.json';
import styles from './LibraryGrid.module.css';
import {
  multiSelectEnabledState,
  multiSelectSeriesListState,
  seriesListState,
  showingLibraryCtxMenuState,
} from '@/renderer/state/libraryStates';
import {
  libraryColumnsState,
  libraryCropCoversState,
  libraryViewState,
} from '@/renderer/state/settingStates';
import { goToSeries } from '@/renderer/features/library/utils';
import ExtensionImage from '../general/ExtensionImage';
import { LibraryView } from '@/common/models/types';
import LibraryGridContextMenu from './LibraryGridContextMenu';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import DefaultTitle from '../general/DefaultTitle';

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
  const libraryView = useRecoilValue(libraryViewState);
  const libraryColumns = useRecoilValue(libraryColumnsState);
  const libraryCropCovers = useRecoilValue(libraryCropCoversState);
  const [multiSelectEnabled, setMultiSelectEnabled] = useRecoilState(multiSelectEnabledState);
  const [multiSelectSeriesList, setMultiSelectSeriesList] = useRecoilState(
    multiSelectSeriesListState,
  );
  const [showingLibraryCtxMenu, setShowingLibraryCtxMenu] = useRecoilState(
    showingLibraryCtxMenuState,
  );
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
    const fileExtensions = constants.IMAGE_EXTENSIONS;
    for (let i = 0; i < fileExtensions.length; i += 1) {
      const thumbnailPath = path.join(thumbnailsDir, `${series.id}.${fileExtensions[i]}`);
      if (fs.existsSync(thumbnailPath)) return `atom://${thumbnailPath}`;
    }

    if (series.extensionId === FS_METADATA.id) {
      return series.remoteCoverUrl ? `atom://${series.remoteCoverUrl}` : blankCover;
    }
    return series.remoteCoverUrl || blankCover;
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
          bg="red.7"
          px={4}
          style={{ zIndex: 10 }}
        >
          {series.numberUnread}
        </Title>
      );
    }
    return <></>;
  };

  useEffect(() => {
    if (multiSelectSeriesList.length === 0) setMultiSelectEnabled(false);
  }, [multiSelectSeriesList]);

  return (
    <>
      <LibraryGridContextMenu
        position={contextMenuPosition}
        series={contextMenuSeries}
        visible={showingLibraryCtxMenu}
        close={() => setShowingLibraryCtxMenu(false)}
        showRemoveModal={props.showRemoveModal}
      />
      <SimpleGrid cols={libraryColumns} spacing="xs">
        {props.getFilteredList().map((series: Series) => {
          const coverSource = getImageSource(series).replaceAll('\\', '/');
          const isMultiSelected = multiSelectSeriesList.includes(series);

          return (
            <span key={`${series.id}-${series.title}`}>
              <div>
                <div
                  className={styles.coverContainer}
                  onClick={() => {
                    if (multiSelectEnabled) {
                      if (isMultiSelected) {
                        setMultiSelectSeriesList(multiSelectSeriesList.filter((s) => s !== series));
                      } else {
                        setMultiSelectSeriesList([...multiSelectSeriesList, series]);
                      }
                    } else {
                      viewFunc(series);
                    }
                  }}
                  onContextMenu={(e) => {
                    if (!multiSelectEnabled) {
                      setContextMenuPosition({ x: e.clientX, y: e.clientY });
                      setContextMenuSeries(series);
                      setShowingLibraryCtxMenu(true);
                    }
                  }}
                  style={{
                    height: libraryCropCovers ? `calc(105vw / ${libraryColumns})` : 'calc(100%)',
                  }}
                >
                  <ExtensionImage
                    url={coverSource}
                    series={series}
                    alt={series.title}
                    style={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                      border:
                        multiSelectEnabled && isMultiSelected
                          ? '3px solid var(--mantine-color-teal-1)'
                          : undefined,
                    }}
                  />
                  {renderUnreadBadge(series)}
                  {libraryView === LibraryView.GridCompact ? (
                    <>
                      <Title
                        className={styles.seriesTitle}
                        order={5}
                        lineClamp={3}
                        p={4}
                        pb={8}
                        style={{ zIndex: 10 }}
                      >
                        {series.title}
                      </Title>
                      {/* TODO: hack to disable overlay during multi-select since the gradient
                          affects the border. Should come up with a better way that preserves both */}
                      {multiSelectEnabled ? undefined : (
                        <Overlay
                          h={
                            libraryCropCovers
                              ? `calc(105vw / ${libraryColumns})`
                              : 'calc(100% - 7px)'
                          }
                          gradient="linear-gradient(0deg, #000000cc, #00000000 40%, #00000000)"
                          zIndex={5}
                        />
                      )}
                    </>
                  ) : (
                    ''
                  )}
                </div>
                {libraryView === LibraryView.GridComfortable ? (
                  <DefaultTitle order={5} lineClamp={3} p={4}>
                    {series.title}
                  </DefaultTitle>
                ) : (
                  ''
                )}
              </div>
            </span>
          );
        })}
      </SimpleGrid>
    </>
  );
};

export default LibraryGrid;
