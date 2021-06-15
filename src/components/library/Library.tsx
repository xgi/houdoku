import React from 'react';
import { useHistory } from 'react-router-dom';
import { connect, ConnectedProps } from 'react-redux';
import Paragraph from 'antd/lib/typography/Paragraph';
import { Series } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import { Modal } from 'antd';
import styles from './Library.css';
import routes from '../../constants/routes.json';
import { changeNumColumns, setFilter } from '../../features/library/actions';
import { loadSeriesList } from '../../features/library/utils';
import { setStatusText } from '../../features/statusbar/actions';
import { RootState } from '../../store';
import SeriesGrid from '../general/SeriesGrid';
import LibraryControlBar from './LibraryControlBar';
import ipcChannels from '../../constants/ipcChannels.json';

const { confirm } = Modal;

const mapState = (state: RootState) => ({
  seriesList: state.library.seriesList,
  columns: state.library.columns,
  filter: state.library.filter,
  filterStatus: state.library.filterStatus,
  filterProgress: state.library.filterProgress,
  filterUserTags: state.library.filterUserTags,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  changeNumColumns: (columns: number) => dispatch(changeNumColumns(columns)),
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
  loadSeriesList: () => loadSeriesList(dispatch),
  setFilter: (filter: string) => dispatch(setFilter(filter)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const Library: React.FC<Props> = (props: Props) => {
  const history = useHistory();

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

  const renderSeriesGrid = () => {
    return (
      <div className={styles.seriesGrid}>
        <SeriesGrid
          columns={props.columns}
          seriesList={props.seriesList}
          sorted
          filter={props.filter}
          filterStatus={props.filterStatus}
          filterProgress={props.filterProgress}
          filterUserTags={props.filterUserTags}
          clickFunc={goToSeries}
          inLibraryFunc={undefined}
        />
      </div>
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
      {props.seriesList.length > 0 ? renderSeriesGrid() : renderEmptyMessage()}
    </>
  );
};

export default connector(Library);
