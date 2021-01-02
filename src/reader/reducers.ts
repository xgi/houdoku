import { PageFit } from '../models/types';
import {
  ReaderState,
  SET_PAGE_FIT,
  SET_SOURCE,
  TOGGLE_PAGE_FIT,
} from './types';

const initialState: ReaderState = {
  series: undefined,
  chapter: undefined,
  pageFit: PageFit.Width,
};

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
    case SET_SOURCE:
      return {
        ...state,
        series: action.payload.series,
        chapter: action.payload.chapter,
      };
    case SET_PAGE_FIT:
      return { ...state, pageFit: action.payload.pageFit };
    case TOGGLE_PAGE_FIT:
      return { ...state, pageFit: nextPageFit(state.pageFit) };
    default:
      return state;
  }
}
