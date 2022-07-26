import React from 'react';
import { useHistory } from 'react-router-dom';
import { connect, ConnectedProps } from 'react-redux';
import Paragraph from 'antd/lib/typography/Paragraph';
import { Series } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import { Modal } from 'antd';
import { useRecoilState, useRecoilValue } from 'recoil';
import styles from './Library.css';
import routes from '../../constants/routes.json';
import { removeSeries } from '../../features/library/utils';
import { RootState } from '../../store';
import SeriesGrid from '../general/SeriesGrid';
import LibraryControlBar from './LibraryControlBar';
import ipcChannels from '../../constants/ipcChannels.json';
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

const { confirm } = Modal;

const mapState = (state: RootState) => ({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const Library: React.FC<Props> = (props: Props) => {
  const history = useHistory();
  const [seriesList, setSeriesList] = useRecoilState(seriesListState);
  const filter = useRecoilValue(filterState);
  const libraryFilterStatus = useRecoilValue(libraryFilterStatusState);
  const libraryFilterProgress = useRecoilValue(libraryFilterProgressState);
  const libraryColumns = useRecoilValue(libraryColumnsState);
  const libraryView = useRecoilValue(libraryViewsState);
  const librarySort = useRecoilValue(librarySortState);

  const goToSeries = async (series: Series) => {
    if (series.id !== undefined) {
      if (
        (await ipcRenderer.invoke(
          ipcChannels.EXTENSION_MANAGER.GET,
          series.extensionId
        )) === undefined
      ) {
        confirm({
          okType: 'primary',
          okText: 'Remove Series',
          okButtonProps: {
            danger: true,
          },
          onOk: () => {
            removeSeries(series, setSeriesList);
          },
          maskClosable: true,
          content: (
            <>
              <Paragraph>
                The extension for this series was not found.
              </Paragraph>
              <Paragraph>
                To access the series, please reinstall the extension. Or, you
                may remove it from your library now.
              </Paragraph>
              <Paragraph type="secondary">
                (extension: {series.extensionId})
              </Paragraph>
            </>
          ),
        });
      } else {
        history.push(`${routes.SERIES}/${series.id}`);
      }
    }
  };

  const renderSeries = () => {
    return (
      <>
        {libraryView === LibraryView.Grid ? (
          <div className={styles.seriesGrid}>
            <SeriesGrid
              columns={libraryColumns}
              seriesList={seriesList}
              filter={filter}
              filterStatus={libraryFilterStatus}
              filterProgress={libraryFilterProgress}
              librarySort={librarySort}
              clickFunc={goToSeries}
              inLibraryFunc={undefined}
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
              clickFunc={goToSeries}
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

export default connector(Library);
