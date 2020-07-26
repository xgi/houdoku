import { connect } from 'react-redux';
import { RootState } from '../store';
import Library from '../components/Library';
import { updateSeriesList } from '../actions';

const mapStateToProps = (state: RootState) => ({
  seriesListUpdated: state.library.seriesListUpdated,
});

const mapDispatchToProps = (dispatch: any) => ({
  updateSeriesList: () => dispatch(updateSeriesList()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Library);
