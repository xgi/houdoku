import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Paragraph from 'antd/lib/typography/Paragraph';
import { Series } from 'houdoku-extension-lib';
import { useRecoilState, useRecoilValue } from 'recoil';
import styles from './Library.css';
import { goToSeries } from '../../features/library/utils';
import LibraryControlBar from './LibraryControlBar';
import SeriesList from '../general/SeriesList';
import { LibraryView } from '../../models/types';
import { filterState, seriesListState } from '../../state/libraryStates';
import {
  libraryFilterStatusState,
  libraryFilterProgressState,
  librarySortState,
  libraryViewsState,
} from '../../state/settingStates';
import LibraryGrid from './LibraryGrid';
import RemoveSeriesModal from './RemoveSeriesModal';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const Library: React.FC<Props> = (props: Props) => {
  const history = useHistory();
  const [removeModalShowing, setRemoveModalShowing] = useState(false);
  const [removeModalSeries, setRemoveModalSeries] = useState<Series | null>(null);
  const [seriesList, setSeriesList] = useRecoilState(seriesListState);
  const filter = useRecoilValue(filterState);
  const libraryFilterStatus = useRecoilValue(libraryFilterStatusState);
  const libraryFilterProgress = useRecoilValue(libraryFilterProgressState);
  const libraryView = useRecoilValue(libraryViewsState);
  const librarySort = useRecoilValue(librarySortState);

  const renderSeries = () => {
    return (
      <>
        <RemoveSeriesModal
          series={removeModalSeries}
          showing={removeModalShowing}
          close={() => setRemoveModalSeries(null)}
        />

        {libraryView === LibraryView.Grid ? (
          <div className={styles.seriesGrid}>
            <LibraryGrid
              showRemoveModal={(series) => {
                setRemoveModalSeries(series);
                setRemoveModalShowing(true);
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
              clickFunc={(series: Series) => goToSeries(series, setSeriesList, history)}
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
