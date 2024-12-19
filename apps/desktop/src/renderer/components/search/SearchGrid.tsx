const fs = require('fs');
import React, { useEffect, useRef } from 'react';
const { ipcRenderer } = require('electron');
import { Series } from '@tiyo/common';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { libraryColumnsState, libraryCropCoversState } from '@/renderer/state/settingStates';
import {
  searchResultState,
  addModalEditableState,
  addModalSeriesState,
  showingAddModalState,
  searchExtensionState,
} from '@/renderer/state/searchStates';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import ExtensionImage from '../general/ExtensionImage';
import SearchGridContextMenu from './SearchGridContextMenu';
import { ContextMenu, ContextMenuTrigger } from '@houdoku/ui/components/ContextMenu';
import { cn } from '@houdoku/ui/util';
import { Skeleton } from '@houdoku/ui/components/Skeleton';
import { ScrollArea } from '@houdoku/ui/components/ScrollArea';

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  loading: boolean;
  handleSearch: (fresh?: boolean) => void;
};

const SearchGrid: React.FC<Props> = (props: Props) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const searchResult = useRecoilValue(searchResultState);
  const libraryColumns = useRecoilValue(libraryColumnsState);
  const libraryCropCovers = useRecoilValue(libraryCropCoversState);
  const searchExtension = useRecoilValue(searchExtensionState);
  const setAddModalSeries = useSetRecoilState(addModalSeriesState);
  const setAddModalEditable = useSetRecoilState(addModalEditableState);
  const [showingAddModal, setShowingAddModal] = useRecoilState(showingAddModalState);

  const handleOpenAddModal = (series: Series) => {
    setAddModalSeries(series);
    setAddModalEditable(searchExtension === FS_METADATA.id);
    setShowingAddModal(!showingAddModal);
  };

  const renderSeriesGrid = () => {
    return searchResult.seriesList.map((series: Series) => {
      return (
        <div key={`${series.id}-${series.title}`} className="space-y-2">
          <ContextMenu>
            <ContextMenuTrigger>
              <div
                className="relative overflow-hidden cursor-pointer"
                onClick={() => handleOpenAddModal(series)}
              >
                <ExtensionImage
                  url={series.remoteCoverUrl}
                  series={series}
                  alt={series.title}
                  className={cn(
                    'hover:scale-105',
                    libraryCropCovers && 'aspect-[70/100]',
                    'h-auto w-full object-cover rounded-md transition-transform',
                  )}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 p-2 flex items-end"
                  style={{
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <span className="line-clamp-3 text-white text-xs font-bold">{series.title}</span>
                </div>
              </div>
            </ContextMenuTrigger>
            <SearchGridContextMenu series={series} viewDetails={() => handleOpenAddModal(series)} />
          </ContextMenu>
        </div>
      );
    });
  };

  const renderLoadingSkeleton = () => {
    const amount =
      {
        2: 4,
        4: 20,
        6: 24,
        8: 40,
      }[libraryColumns] || 8;

    return [...Array(amount).keys()].map((x) => (
      // aspect ratio of 7/10 -- (100/70 * 100)% ~= 142.857%
      <div key={`skeleton-${x}`} className="relative w-full pb-[142%]">
        <div className="absolute inset-0">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      </div>
    ));
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    if (!searchResult.hasMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;

      const distanceFromBottom = scrollHeight - (clientHeight + scrollTop);
      const ratioOfVisibleHeight = distanceFromBottom / clientHeight;

      if (ratioOfVisibleHeight < 0.3) {
        // note: relying on handleSearch to debounce
        props.handleSearch();
      }
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [searchResult, props.handleSearch]);

  useEffect(() => {
    if (!searchResult.hasMore) return;
    const viewport = viewportRef.current;
    if (!viewport || !viewport.firstElementChild) return;

    if (viewport.firstElementChild.clientHeight < viewport.clientHeight) {
      props.handleSearch();
    }
  }, [props.loading]);

  return (
    <>
      <ScrollArea viewportRef={viewportRef} className="h-[calc(100vh-20px-64px)] w-full pr-4 -mr-2">
        <div
          className={cn(
            libraryColumns === 2 && 'grid-cols-2',
            libraryColumns === 4 && 'grid-cols-4',
            libraryColumns === 6 && 'grid-cols-6',
            libraryColumns === 8 && 'grid-cols-8',
            `grid gap-2`,
          )}
        >
          {renderSeriesGrid()}
          {props.loading ? renderLoadingSkeleton() : ''}
        </div>
      </ScrollArea>
    </>
  );
};

export default SearchGrid;
