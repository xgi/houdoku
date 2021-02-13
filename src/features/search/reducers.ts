import { SearchState, SET_SEARCH_EXTENSION } from './types';

const initialState: SearchState = {
  searchExtension: 2,
};

export default function search(
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): SearchState {
  switch (action.type) {
    case SET_SEARCH_EXTENSION:
      return { ...state, searchExtension: action.payload.searchExtension };
    default:
      return state;
  }
}
