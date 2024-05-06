const fs = require('fs');
import React, { useEffect, useRef, useState } from 'react';
const { ipcRenderer } = require('electron');
import { Series } from '@tiyo/common';
import { Overlay, SimpleGrid, Skeleton, Title, ScrollArea } from '@mantine/core';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import ipcChannels from '@/common/constants/ipcChannels.json';
import styles from './SearchGrid.module.css';
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

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  loading: boolean;
  inLibrary: (series: Series) => boolean;
  handleSearch: (fresh?: boolean) => void;
};

const SearchGrid: React.FC<Props> = (props: Props) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const searchResult = useRecoilValue(searchResultState);
  const libraryColumns = useRecoilValue(libraryColumnsState);
  const libraryCropCovers = useRecoilValue(libraryCropCoversState);
  const searchExtension = useRecoilValue(searchExtensionState);
  const setAddModalSeries = useSetRecoilState(addModalSeriesState);
  const setAddModalEditable = useSetRecoilState(addModalEditableState);
  const [showingAddModal, setShowingAddModal] = useRecoilState(showingAddModalState);
  const [showingContextMenu, setShowingContextMenu] = useState(false);
  const [contextMenuSeries, setContextMenuSeries] = useState<Series | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const handleOpenAddModal = (series: Series) => {
    setAddModalSeries(series);
    setAddModalEditable(searchExtension === FS_METADATA.id);
    setShowingAddModal(!showingAddModal);
  };

  const renderSeriesGrid = () => {
    return searchResult.seriesList.map((series: Series) => {
      const inLibrary = props.inLibrary(series);

      return (
        <div
          key={series.sourceId}
          className={styles.coverContainer}
          onClick={() => {
            if (inLibrary) return;
            handleOpenAddModal(series);
          }}
          onContextMenu={(e) => {
            if (inLibrary) return;
            setContextMenuPosition({ x: e.clientX, y: e.clientY });
            setContextMenuSeries(series);
            setShowingContextMenu(true);
          }}
          style={{
            height: libraryCropCovers ? `calc(105vw / ${libraryColumns})` : '100%',
            cursor: inLibrary ? 'not-allowed' : 'pointer',
          }}
        >
          <Overlay
            gradient="linear-gradient(0deg, #000000cc, #00000000 40%, #00000000)"
            zIndex={5}
          />
          <ExtensionImage
            url={series.remoteCoverUrl}
            series={series}
            alt={series.title}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
          />
          {inLibrary ? <Overlay opacity={0.5} color="#2B8A3E" /> : ''}
          <Title className={styles.seriesTitle} order={5} lineClamp={3} p={4}>
            {series.title}
          </Title>
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
      <Skeleton key={`skeleton-${x}`} style={{ height: `calc(105vw / ${libraryColumns})` }} />
    ));
  };

  useEffect(() => {
    if (!props.loading && viewportRef.current) {
      if (searchResult.seriesList.length === 0) {
        viewportRef.current.scrollTo({ top: 0 });
      } else if (
        searchResult.hasMore &&
        viewportRef.current &&
        gridRef.current &&
        gridRef.current.clientHeight < viewportRef.current.clientHeight
      )
        props.handleSearch();
    }
  }, [props.loading]);

  const handleScroll = (position: { x: number; y: number }) => {
    if (!viewportRef.current || !searchResult.hasMore) return;

    const distanceFromBottom =
      viewportRef.current.scrollHeight - (viewportRef.current.clientHeight + position.y);
    const ratioOfVisibleHeight = distanceFromBottom / viewportRef.current.clientHeight;

    if (ratioOfVisibleHeight < 0.3) {
      props.handleSearch();
    }
  };

  return (
    <>
      <SearchGridContextMenu
        position={contextMenuPosition}
        series={contextMenuSeries}
        visible={showingContextMenu}
        close={() => setShowingContextMenu(false)}
        openAddModal={handleOpenAddModal}
      />
      <ScrollArea
        style={{ height: 'calc(100vh - 24px - 72px)' }}
        pr="xl"
        mr={-16}
        viewportRef={viewportRef}
        onScrollPositionChange={handleScroll}
      >
        <SimpleGrid cols={libraryColumns} spacing="xs" ref={gridRef}>
          {renderSeriesGrid()}
          {props.loading ? renderLoadingSkeleton() : ''}
        </SimpleGrid>
      </ScrollArea>
    </>
  );
};

export default SearchGrid;
