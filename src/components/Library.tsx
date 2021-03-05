import React from 'react';
import { useHistory } from 'react-router-dom';
import { connect, ConnectedProps } from 'react-redux';
import Paragraph from 'antd/lib/typography/Paragraph';
import { Series } from '../models/types';
import styles from './Library.css';
import routes from '../constants/routes.json';
import { changeNumColumns, setFilter } from '../features/library/actions';
import { loadSeriesList } from '../features/library/utils';
import { setStatusText } from '../features/statusbar/actions';
import { RootState } from '../store';
import LibraryGrid from './LibraryGrid';
import LibraryControlBar from './LibraryControlBar';

const mapState = (state: RootState) => ({
  seriesList: state.library.seriesList,
  columns: state.library.columns,
  filter: state.library.filter,
  filterStatus: state.library.filterStatus,
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

  const goToSeries = (series: Series) => {
    if (series.id !== undefined) history.push(`${routes.SERIES}/${series.id}`);
  };

  const renderLibraryGrid = () => {
    return (
      <div className={styles.libraryGrid}>
        <LibraryGrid
          columns={props.columns}
          seriesList={props.seriesList}
          filter={props.filter}
          filterStatus={props.filterStatus}
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
          Your library is empty. Click the Add Series tab on the left to get
          started.
        </Paragraph>
      </div>
    );
  };

  return (
    <>
      <LibraryControlBar />
      {props.seriesList.length > 0 ? renderLibraryGrid() : renderEmptyMessage()}
    </>
  );
};

export default connector(Library);
