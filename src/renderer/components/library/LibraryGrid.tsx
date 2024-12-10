const fs = require('fs');
import path from 'path';
import React, { useEffect } from 'react';
const { ipcRenderer } = require('electron');
import { Series } from '@tiyo/common';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import blankCover from '@/renderer/img/blank_cover.png';
import ipcChannels from '@/common/constants/ipcChannels.json';
import constants from '@/common/constants/constants.json';
import {
  multiSelectEnabledState,
  multiSelectSeriesListState,
  seriesListState,
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
import { ContextMenu, ContextMenuTrigger } from '@/ui/components/ContextMenu';
import { cn } from '@/ui/util';

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
      if (fs.existsSync(thumbnailPath)) return `atom://${encodeURIComponent(thumbnailPath)}`;
    }

    if (series.extensionId === FS_METADATA.id) {
      return series.remoteCoverUrl
        ? `atom://${encodeURIComponent(series.remoteCoverUrl)}`
        : blankCover;
    }
    return series.remoteCoverUrl || blankCover;
  };

  useEffect(() => {
    if (multiSelectSeriesList.length === 0) setMultiSelectEnabled(false);
  }, [multiSelectSeriesList]);

  return (
    <div
      className={cn(
        libraryColumns === 2 && 'grid-cols-2',
        libraryColumns === 4 && 'grid-cols-4',
        libraryColumns === 6 && 'grid-cols-6',
        libraryColumns === 8 && 'grid-cols-8',
        `grid gap-2`,
      )}
    >
      {props.getFilteredList().map((series: Series) => {
        const coverSource = getImageSource(series).replaceAll('\\', '/');
        const isMultiSelected = multiSelectSeriesList.includes(series);

        return (
          <div key={`${series.id}-${series.title}`} className="space-y-2">
            <ContextMenu>
              <ContextMenuTrigger>
                <div
                  className="relative overflow-hidden cursor-pointer"
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
                >
                  <ExtensionImage
                    url={coverSource}
                    series={series}
                    alt={series.title}
                    className={cn(
                      !multiSelectEnabled && 'hover:scale-105',
                      multiSelectEnabled && isMultiSelected && 'border-4 border-sky-500',
                      libraryCropCovers && 'aspect-[70/100]',
                      'h-auto w-auto object-cover rounded-md transition-transform',
                    )}
                  />

                  {series.numberUnread > 0 && (
                    <div className="absolute top-0 right-0 bg-sky-500 px-1 mr-1 mt-1 min-w-5 rounded-md font-semibold text-white text-center">
                      {series.numberUnread}
                    </div>
                  )}

                  {libraryView === LibraryView.GridCompact && (
                    <div
                      className="absolute bottom-0 left-0 right-0 p-2 flex items-end"
                      style={{
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      <span className="line-clamp-3 text-white text-xs font-bold">
                        {series.title}
                      </span>
                    </div>
                  )}
                </div>
              </ContextMenuTrigger>
              <LibraryGridContextMenu series={series} showRemoveModal={props.showRemoveModal} />
            </ContextMenu>

            {libraryView === LibraryView.GridComfortable && (
              <div className="space-y-1 text-sm pb-3">
                <h3 className="font-medium leading-none line-clamp-3">{series.title}</h3>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LibraryGrid;
