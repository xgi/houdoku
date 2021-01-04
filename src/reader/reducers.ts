import { PageFit } from '../models/types';
import {
  CHANGE_PAGE_NUMBER,
  ReaderState,
  SET_PAGE_FIT,
  SET_PAGE_NUMBER,
  TOGGLE_PAGE_FIT,
  TOGGLE_TWO_PAGE_EVEN_START,
  TOGGLE_TWO_PAGE_VIEW,
} from './types';

const initialState: ReaderState = {
  pageNumber: 1,
  lastPageNumber: 20,
  pageFit: PageFit.Width,
  twoPageView: false,
  twoPageEvenStart: false,
};

function sanitizedPageNumber(
  pageNumber: number,
  lastPageNumber: number
): number {
  if (pageNumber < 1) {
    return 1;
  }
  if (pageNumber > lastPageNumber) {
    return lastPageNumber;
  }
  return pageNumber;
}

function nextPageFit(pageFit: PageFit): PageFit {
  if (pageFit === PageFit.Height) {
    return PageFit.Width;
  }
  if (pageFit === PageFit.Width) {
    return PageFit.Height;
  }
  return PageFit.Auto;
}

export default function status(
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): ReaderState {
  switch (action.type) {
    case SET_PAGE_NUMBER:
      return {
        ...state,
        pageNumber: sanitizedPageNumber(
          action.payload.pageNumber,
          state.lastPageNumber
        ),
      };
    case CHANGE_PAGE_NUMBER:
      return {
        ...state,
        pageNumber: sanitizedPageNumber(
          state.pageNumber + action.payload.delta,
          state.lastPageNumber
        ),
      };
    case SET_PAGE_FIT:
      return { ...state, pageFit: action.payload.pageFit };
    case TOGGLE_PAGE_FIT:
      return { ...state, pageFit: nextPageFit(state.pageFit) };
    case TOGGLE_TWO_PAGE_VIEW:
      return { ...state, twoPageView: !state.twoPageView };
    case TOGGLE_TWO_PAGE_EVEN_START:
      return { ...state, twoPageEvenStart: !state.twoPageEvenStart };
    default:
      return state;
  }
}
