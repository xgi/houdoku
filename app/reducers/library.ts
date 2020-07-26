const initialState = {
  seriesListUpdated: 'no',
};

const library = (state = initialState, action: any) => {
  switch (action.type) {
    case 'UPDATE_SERIES_LIST':
      console.log(state);
      return { ...state, seriesListUpdated: 'yes' };
    default:
      return state;
  }
};

export default library;
