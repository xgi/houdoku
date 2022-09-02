import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Paragraph from 'antd/lib/typography/Paragraph';
import { Series } from 'houdoku-extension-lib';
import { useRecoilState, useRecoilValue } from 'recoil';
import styles from './Library.css';
import { goToSeries } from '../../features/library/utils';
import SeriesGrid from '../general/SeriesGrid';
import LibraryControlBar from './LibraryControlBar';
import SeriesList from '../general/SeriesList';
import { LibraryView } from '../../models/types';
import { filterState, seriesListState } from '../../state/libraryStates';
import {
  libraryFilterStatusState,
  libraryFilterProgressState,
  libraryColumnsState,
  librarySortState,
  libraryViewsState,
} from '../../state/settingStates';
import SeriesExtensionNotFoundModalContent from './SeriesExtensionNotFoundModalContent';
import RemoveSeriesModal from './RemoveSeriesModal';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const Library: React.FC<Props> = (props: Props) => {
  const history = useHistory();
  const [showingRemoveModal, setShowingRemoveModal] = useState(false);
  const [removeModalSeries, setRemoveModalSeries] = useState<Series | null>(null);
  const [seriesList, setSeriesList] = useRecoilState(seriesListState);
  const filter = useRecoilValue(filterState);
  const libraryFilterStatus = useRecoilValue(libraryFilterStatusState);
  const libraryFilterProgress = useRecoilValue(libraryFilterProgressState);
  const libraryColumns = useRecoilValue(libraryColumnsState);
  const libraryView = useRecoilValue(libraryViewsState);
  const librarySort = useRecoilValue(librarySortState);

  const clickFunc = (series: Series) =>
    goToSeries(
      series,
      setSeriesList,
      <SeriesExtensionNotFoundModalContent series={series} />,
      history
    );

  const renderSeries = () => {
    return (
      <>
        <RemoveSeriesModal
          series={removeModalSeries}
          showing={showingRemoveModal}
          close={() => setShowingRemoveModal(false)}
        />
        {libraryView === LibraryView.Grid ? (
          <div className={styles.seriesGrid}>
            <SeriesGrid
              columns={libraryColumns}
              seriesList={seriesList}
              filter={filter}
              filterStatus={libraryFilterStatus}
              filterProgress={libraryFilterProgress}
              librarySort={librarySort}
              contextMenuEnabled
              clickFunc={clickFunc}
              inLibraryFunc={undefined}
              showRemoveModal={(series: Series) => {
                setRemoveModalSeries(series);
                setShowingRemoveModal(true);
              }}
            />
          </div>
        ) : (
          <div className={styles.seriesList}>
            <SeriesList
              seriesList={seriesList}
              filter={filter}
              filterStatus={libraryFilterStatus}
              filterProgress={libraryFilterProgress}
              librarySort={librarySort}
              clickFunc={clickFunc}
              inLibraryFunc={undefined}
            />
          </div>
        )}
      </>
    );
  };

  const renderEmptyMessage = () => {
    return (
      <div className={styles.emptyMessageContainer}>
        <Paragraph>
          Your library is empty. Install extensions from the tab on the left,
          <br />
          and then go to Add Series to start building your library.
        </Paragraph>
      </div>
    );
  };

  return (
    <>
      <LibraryControlBar />
      {seriesList.length > 0 ? renderSeries() : renderEmptyMessage()}
    </>
  );
};

export default Library;
