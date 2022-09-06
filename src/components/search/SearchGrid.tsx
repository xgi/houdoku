import fs from 'fs';
import React from 'react';
import { ipcRenderer } from 'electron';
import { Series } from 'houdoku-extension-lib';
import { Overlay, SimpleGrid, Skeleton, Title } from '@mantine/core';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import ipcChannels from '../../constants/ipcChannels.json';
import styles from './SearchGrid.css';
import { libraryColumnsState } from '../../state/settingStates';
import {
  searchResultState,
  curViewingPageState,
  addModalEditableState,
  addModalSeriesState,
  showingAddModalState,
  searchExtensionState,
} from '../../state/searchStates';
import { FS_METADATA } from '../../services/extensions/filesystem';

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  loading: boolean;
  getPageSize: (columns: number) => number;
  inLibrary: (series: Series) => boolean;
};

const SearchGrid: React.FC<Props> = (props: Props) => {
  const searchResult = useRecoilValue(searchResultState);
  const curViewingPage = useRecoilValue(curViewingPageState);
  const libraryColumns = useRecoilValue(libraryColumnsState);
  const searchExtension = useRecoilValue(searchExtensionState);
  const setAddModalSeries = useSetRecoilState(addModalSeriesState);
  const setAddModalEditable = useSetRecoilState(addModalEditableState);
  const [showingAddModal, setShowingAddModal] = useRecoilState(showingAddModalState);

  const renderSeriesGrid = () => {
    return searchResult.seriesList
      .slice(0, curViewingPage * props.getPageSize(libraryColumns))
      .map((series: Series) => {
        const inLibrary = props.inLibrary(series);

        return (
          <div
            key={series.title}
            className={styles.coverContainer}
            onClick={() => {
              if (inLibrary) return;

              setAddModalSeries(series);
              setAddModalEditable(searchExtension === FS_METADATA.id);
              setShowingAddModal(!showingAddModal);
            }}
            style={{
              backgroundImage: `linear-gradient(0deg, #000000cc, #00000000 40%, #00000000), url("${series.remoteCoverUrl}")`,
              height: `calc(105vw / ${libraryColumns})`,
              cursor: inLibrary ? 'not-allowed' : 'pointer',
            }}
          >
            {inLibrary ? <Overlay opacity={0.7} color="black" /> : ''}
            <Title className={styles.seriesTitle} order={5} lineClamp={3} p={4}>
              {series.title}
            </Title>
          </div>
        );
      });
  };

  const renderLoadingSkeleton = () => {
    return [...Array(props.getPageSize(libraryColumns)).keys()].map((x) => (
      <Skeleton key={`skeleton-${x}`} style={{ height: `calc(105vw / ${libraryColumns})` }} />
    ));
  };

  return (
    <>
      <SimpleGrid cols={libraryColumns} spacing="xs">
        {renderSeriesGrid()}
        {props.loading ? renderLoadingSkeleton() : ''}
      </SimpleGrid>
    </>
  );
};

export default SearchGrid;
