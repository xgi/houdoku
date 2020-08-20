import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import Button from '@material-ui/core/Button';
// import { Link } from 'react-router-dom';
// import routes from '../constants/routes.json';
import { RootState } from '../store';
// import styles from './LibraryPage.css';
// import blankCover from '../img/blank_cover.png';
import LibraryGrid from './LibraryGrid';
import {
  updateSeriesList,
  changeNumColumns,
  saveLibrary,
  readLibrary,
  deleteLibrary,
} from '../actions/libraryActions';

const mapState = (state: RootState) => ({
  library: state.library.library,
  columns: state.library.columns,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  updateSeriesList: () => dispatch(updateSeriesList()),
  changeNumColumns: (columns: number) => dispatch(changeNumColumns(columns)),
  saveLibrary: () => dispatch(saveLibrary()),
  readLibrary: () => dispatch(readLibrary()),
  deleteLibrary: () => dispatch(deleteLibrary()),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

type LibraryProps = PropsFromRedux & {
  something: string;
};

const LibraryPage = (props: LibraryProps) => (
  <div>
    <p>this is the top of the page.</p>
    <Button onClick={props.updateSeriesList}>update the series list</Button>
    <Button onClick={() => props.changeNumColumns(8)}>
      update num columns
    </Button>
    <Button onClick={() => props.saveLibrary()}>save library</Button>
    <Button onClick={() => props.readLibrary()}>read library</Button>
    <Button onClick={() => props.deleteLibrary()}>delete library</Button>
    {props.library != null && (
      <LibraryGrid
        columns={props.columns}
        seriesList={props.library.seriesList}
      />
    )}
    {/* <Link to={routes.SERIES}>to Series</Link> */}
  </div>
);

export default connector(LibraryPage);
