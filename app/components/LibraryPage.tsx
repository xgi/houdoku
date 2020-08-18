import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { RootState } from '../store';
// import styles from './LibraryPage.css';
// import blankCover from '../img/blank_cover.png';
import CustomGrid from './CustomGrid';
import { updateSeriesList, changeNumColumns } from '../actions/libraryActions';

const mapState = (state: RootState) => ({
  seriesListUpdated: state.library.seriesListUpdated,
  columns: state.library.columns,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  updateSeriesList: () => dispatch(updateSeriesList()),
  changeNumColumns: (columns: number) => dispatch(changeNumColumns(columns)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

type LibraryProps = PropsFromRedux & {
  something: string;
};

const LibraryPage = (props: LibraryProps) => (
  <div>
    <p>
      series list is:
      {props.seriesListUpdated}
    </p>
    <Button onClick={props.updateSeriesList}>update the series list</Button>
    <Button onClick={() => props.changeNumColumns(8)}>
      update num columns
    </Button>
    <CustomGrid columns={props.columns} />
    {/* <Link to={routes.SERIES}>to Series</Link> */}
  </div>
);

export default connector(LibraryPage);
