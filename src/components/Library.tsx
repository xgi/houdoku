import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Slider, Input } from 'antd';
import { Header } from 'antd/lib/layout/layout';
import { connect, ConnectedProps } from 'react-redux';
import { Series } from '../models/types';
import styles from './Library.css';
import routes from '../constants/routes.json';
import { changeNumColumns, setFilter } from '../features/library/actions';
import { loadSeriesList, reloadSeriesList } from '../features/library/utils';
import { setStatusText } from '../features/statusbar/actions';
import { RootState } from '../store';
import LibraryGrid from './LibraryGrid';
import Paragraph from 'antd/lib/typography/Paragraph';

const mapState = (state: RootState) => ({
  seriesList: state.library.seriesList,
  columns: state.library.columns,
  filter: state.library.filter,
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
      <>
        <Header className={styles.header}>
          <Button
            className={styles.reloadButton}
            onClick={() =>
              reloadSeriesList(
                props.seriesList,
                props.setStatusText,
                props.loadSeriesList
              )
            }
          >
            Reload All Series
          </Button>
          <div className={styles.controlBarSpacer} />
          <Paragraph className={styles.columnsText}>Columns:</Paragraph>
          <Slider
            className={styles.columnsSlider}
            min={2}
            max={8}
            step={2}
            value={props.columns}
            onChange={(value: number) => props.changeNumColumns(value)}
          />
          <Input
            className={styles.seriesFilter}
            placeholder="Filter series list..."
            onChange={(e) => props.setFilter(e.target.value)}
          />
        </Header>
        {/* <Uploader callback={(path: string) => importSeries(1, path)} /> */}
      </>
      {props.seriesList.length > 0 ? renderLibraryGrid() : renderEmptyMessage()}
    </>
  );
};

export default connector(Library);
