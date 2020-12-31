import { PageFit } from '../models/types';
import { SET_PAGE_FIT, ReaderAction } from './types';

// eslint-disable-next-line import/prefer-default-export
export function setPageFit(pageFit: PageFit): ReaderAction {
  return {
    type: SET_PAGE_FIT,
    payload: {
      pageFit,
    },
  };
}
