import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styles from './ReaderViewer.css';
import { ReadingDirection, PageStyle } from '../../models/types';
import { lastPageNumberState, pageDataListState, pageNumberState } from '../../state/readerStates';
import {
  fitContainToWidthState,
  fitContainToHeightState,
  fitStretchState,
  pageStyleState,
  readingDirectionState,
  hideScrollbarState,
  longStripMarginState,
} from '../../state/settingStates';

const ROOT_ID = 'root';

type Props = {
  changePage: (left: boolean, toBound?: boolean) => void;
};

const ReaderViewer: React.FC<Props> = (props: Props) => {
  const viewerContainer = useRef<HTMLDivElement>(null);
  const [skipChangePageNumEffect, setSkipChangePageNumEffect] = useState(false);
  const [pageNumber, setPageNumber] = useRecoilState(pageNumberState);
  const lastPageNumber = useRecoilValue(lastPageNumberState);
  const pageDataList = useRecoilValue(pageDataListState);
  const fitContainToWidth = useRecoilValue(fitContainToWidthState);
  const fitContainToHeight = useRecoilValue(fitContainToHeightState);
  const fitStretch = useRecoilValue(fitStretchState);
  const pageStyle = useRecoilValue(pageStyleState);
  const readingDirection = useRecoilValue(readingDirectionState);
  const hideScrollbar = useRecoilValue(hideScrollbarState);
  const longStripMargin = useRecoilValue(longStripMarginState);

  const viewerContainerClickHandler = (e: React.MouseEvent) => {
    if (pageStyle === PageStyle.LongStrip) {
      const visibleHeight = window.innerHeight;
      if (e.clientY > visibleHeight * 0.6) {
        props.changePage(false);
      } else if (e.clientY < visibleHeight * 0.4) {
        props.changePage(true);
      }
    } else {
      const visibleWidth = window.innerWidth;
      if (e.clientX > visibleWidth * 0.6) {
        props.changePage(false);
      } else if (e.clientX < visibleWidth * 0.4) {
        props.changePage(true);
      }
    }
  };

  const getPageImage = (num: number, showing: boolean) => {
    let isLeft = false;
    let isRight = false;
    if (pageStyle === PageStyle.Double) {
      if (readingDirection === ReadingDirection.LeftToRight) {
        isLeft = num === pageNumber;
        isRight = num === pageNumber + 1;
      } else {
        isRight = num === pageNumber;
        isLeft = num === pageNumber + 1;
      }
    }

    return (
      <img
        key={num}
        src={pageDataList[num - 1]}
        alt={`Page ${num}`}
        style={showing ? {} : { display: 'none' }}
        className={`
      ${styles.pageImage}
      ${isLeft ? styles.left : ''}
      ${isRight ? styles.right : ''}
      ${fitContainToWidth ? styles.containWidth : ''}
      ${fitContainToHeight ? styles.containHeight : ''}
      ${fitStretch && (fitContainToWidth || fitContainToHeight) ? styles.grow : ''}
      ${pageStyle === PageStyle.LongStrip && longStripMargin ? styles.margin : ''}
    `}
      />
    );
  };

  /**
   * Get the page container, which contains all page images (with only the current one(s) shown).
   *
   * This is used for the Single and Double page styles.
   */
  const getSinglePageContainer = () => {
    let pageImages = [];
    for (let i = 1; i <= lastPageNumber; i += 1) {
      const showing = i === pageNumber || (pageStyle === PageStyle.Double && i === pageNumber + 1);
      pageImages.push(getPageImage(i, showing));
    }

    // in the Double style, the image on the right needs to be at a later index
    // in the array -- therefore in right-to-left mode, we need to reverse the array
    if (readingDirection === ReadingDirection.RightToLeft) {
      pageImages = pageImages.reverse();
    }

    return (
      <div
        className={`
            ${styles.page}
            ${fitContainToWidth ? styles.containWidth : ''}
            ${fitContainToHeight ? styles.containHeight : ''}
            ${fitStretch && (fitContainToWidth || fitContainToHeight) ? styles.grow : ''}
          `}
      >
        {pageImages}
      </div>
    );
  };

  /**
   * Get the page containers, with one per page image.
   *
   * This is used for the LongStrip page style. Unlike getSinglePageContainer(), this method
   * creates a separate container per page,
   *
   * All containers and pages are rendered with this layout (i.e. this doesn't use display:none).
   * The Double and LongStrip layouts are mutually exclusive.
   */
  const getSeparatePageContainers = () => {
    const pageContainers = [];
    for (let i = 1; i <= lastPageNumber; i += 1) {
      pageContainers.push(
        <div
          key={i}
          className={`
            ${styles.page}
            ${fitContainToWidth ? styles.containWidth : ''}
            ${fitContainToHeight ? styles.containHeight : ''}
            ${fitStretch && (fitContainToWidth || fitContainToHeight) ? styles.grow : ''}
          `}
        >
          {getPageImage(i, true)}
        </div>
      );
    }
    return pageContainers;
  };

  /**
   * Add handling to update the page number when scrolling.
   *
   * Only updates the page number when on the LongStrip style.
   */
  useEffect(() => {
    const root = document.getElementById(ROOT_ID);
    const readerPage = root?.firstElementChild;

    if (root && readerPage) {
      if (pageStyle === PageStyle.LongStrip) {
        root.onscroll = () => {
          if (viewerContainer.current) {
            let imageHeightSum = 0;

            let childNum = 0;
            for (
              childNum = 0;
              childNum < viewerContainer.current.children.length &&
              imageHeightSum <
                root.scrollTop +
                  root.clientHeight -
                  parseInt(getComputedStyle(readerPage).marginTop, 10);
              childNum += 1
            ) {
              imageHeightSum += viewerContainer.current.children[childNum].clientHeight;
            }

            if (pageNumber !== childNum && childNum <= lastPageNumber && childNum > 0) {
              setSkipChangePageNumEffect(true);
              setPageNumber(childNum);
            }
          }
        };
      } else {
        root.onscroll = () => true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageStyle, lastPageNumber, pageNumber]);

  /**
   * Scrolls to the current page number when it is changed.
   *
   * This is primarily for the LongStrip style, but on Single/Double
   * we also scroll up to the top since the user may have scrolled
   * to the button of the previous page.
   */
  useEffect(() => {
    if (pageStyle === PageStyle.LongStrip) {
      if (skipChangePageNumEffect) {
        setSkipChangePageNumEffect(false);
      } else if (viewerContainer.current) {
        const elem = viewerContainer.current.children[pageNumber - 1];
        if (elem !== undefined) {
          elem.scrollIntoView();

          // if we're not scrolling to the last page, need to scroll up some
          // since the image is covered by the header
          const root = document.getElementById(ROOT_ID);
          const readerPage = root?.firstElementChild;
          if (root && readerPage && pageNumber < lastPageNumber) {
            root.scrollTop -= parseInt(getComputedStyle(readerPage).marginTop, 10);
          }
        }
      }
    } else {
      const root = document.getElementById(ROOT_ID);
      if (root) root.scrollTop = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageStyle, pageNumber, lastPageNumber]);

  return (
    <>
      {/* {props.overlayPageNumber ? renderPageNumberOverlay() : <></>} */}
      <div
        ref={viewerContainer}
        className={`
          ${styles.container}
          ${hideScrollbar ? styles.noScrollbar : ''}`}
        onClick={(e) => viewerContainerClickHandler(e)}
      >
        {pageStyle === PageStyle.LongStrip ? getSeparatePageContainers() : getSinglePageContainer()}
      </div>
    </>
  );
};

export default ReaderViewer;
