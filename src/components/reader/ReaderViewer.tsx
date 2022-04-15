import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../store';
import styles from './ReaderViewer.css';
import { ReadingDirection, PageStyle } from '../../models/types';
import { setPageNumber } from '../../features/reader/actions';

const mapState = (state: RootState) => ({
  pageNumber: state.reader.pageNumber,
  lastPageNumber: state.reader.lastPageNumber,
  pageDataList: state.reader.pageDataList,
  series: state.reader.series,
  showingSidebar: state.reader.showingSidebar,
  fitContainToWidth: state.settings.fitContainToWidth,
  fitContainToHeight: state.settings.fitContainToHeight,
  fitStretch: state.settings.fitStretch,
  pageStyle: state.settings.pageStyle,
  readingDirection: state.settings.readingDirection,
  overlayPageNumber: state.settings.overlayPageNumber,
  hideScrollbar: state.settings.hideScrollbar,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setPageNumber: (pageNumber: number) => dispatch(setPageNumber(pageNumber)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  changePage: (left: boolean, toBound?: boolean) => void;
};

const ROOT_ID = 'root';

const ReaderViewer: React.FC<Props> = (props: Props) => {
  const viewerContainer = useRef<HTMLDivElement>(null);
  const [skipChangePageNumEffect, setSkipChangePageNumEffect] = useState(false);

  const viewerContainerClickHandler = (e: any) => {
    if (viewerContainer.current) {
      const rect: DOMRect = viewerContainer.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;

      if (relX > rect.width * 0.6) {
        props.changePage(false);
      } else if (relX < rect.width * 0.4) {
        props.changePage(true);
      }
    }
  };

  const getPageImage = (pageNumber: number, showing: boolean) => {
    let isLeft = false;
    let isRight = false;
    if (props.pageStyle === PageStyle.Double) {
      if (props.readingDirection === ReadingDirection.LeftToRight) {
        isLeft = pageNumber === props.pageNumber;
        isRight = pageNumber === props.pageNumber + 1;
      } else {
        isRight = pageNumber === props.pageNumber;
        isLeft = pageNumber === props.pageNumber + 1;
      }
    }

    return (
      <img
        key={pageNumber}
        src={props.pageDataList[pageNumber - 1]}
        alt={`Page ${pageNumber}`}
        style={showing ? {} : { display: 'none' }}
        className={`
      ${styles.pageImage}
      ${isLeft ? styles.left : ''}
      ${isRight ? styles.right : ''}
      ${props.fitContainToWidth ? styles.containWidth : ''}
      ${props.fitContainToHeight ? styles.containHeight : ''}
      ${
        props.fitStretch &&
        (props.fitContainToWidth || props.fitContainToHeight)
          ? styles.grow
          : ''
      }
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
    for (let i = 1; i <= props.lastPageNumber; i += 1) {
      const showing =
        i === props.pageNumber ||
        (props.pageStyle === PageStyle.Double && i === props.pageNumber + 1);
      pageImages.push(getPageImage(i, showing));
    }

    // in the Double style, the image on the right needs to be at a later index
    // in the array -- therefore in right-to-left mode, we need to reverse the array
    if (props.readingDirection === ReadingDirection.RightToLeft) {
      pageImages = pageImages.reverse();
    }

    return (
      <div
        className={`
            ${styles.page}
            ${props.fitContainToWidth ? styles.containWidth : ''}
            ${props.fitContainToHeight ? styles.containHeight : ''}
            ${
              props.fitStretch &&
              (props.fitContainToWidth || props.fitContainToHeight)
                ? styles.grow
                : ''
            }
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
    for (let i = 1; i <= props.lastPageNumber; i += 1) {
      pageContainers.push(
        <div
          key={i}
          className={`
            ${styles.page}
            ${props.fitContainToWidth ? styles.containWidth : ''}
            ${props.fitContainToHeight ? styles.containHeight : ''}
            ${
              props.fitStretch &&
              (props.fitContainToWidth || props.fitContainToHeight)
                ? styles.grow
                : ''
            }
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
      if (props.pageStyle === PageStyle.LongStrip) {
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
                  parseInt(getComputedStyle(readerPage).marginTop);
              childNum += 1
            ) {
              imageHeightSum +=
                viewerContainer.current.children[childNum].clientHeight;
            }

            if (
              props.pageNumber !== childNum &&
              childNum <= props.lastPageNumber &&
              childNum > 0
            ) {
              setSkipChangePageNumEffect(true);
              props.setPageNumber(childNum);
            }
          }
        };
      } else {
        root.onscroll = () => true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pageStyle, props.lastPageNumber, props.pageNumber]);

  /**
   * Scrolls to the current page number when it is changed.
   *
   * This is primarily for the LongStrip style, but on Single/Double
   * we also scroll up to the top since the user may have scrolled
   * to the button of the previous page.
   */
  useEffect(() => {
    if (props.pageStyle === PageStyle.LongStrip) {
      if (skipChangePageNumEffect) {
        setSkipChangePageNumEffect(false);
      } else if (viewerContainer.current) {
        const elem = viewerContainer.current.children[props.pageNumber - 1];
        if (elem !== undefined) {
          elem.scrollIntoView();

          // if we're not scrolling to the last page, need to scroll up some
          // since the image is covered by the header
          const root = document.getElementById(ROOT_ID);
          const readerPage = root?.firstElementChild;
          if (root && readerPage && props.pageNumber < props.lastPageNumber) {
            root.scrollTop -= parseInt(getComputedStyle(readerPage).marginTop);
          }
        }
      }
    } else {
      const root = document.getElementById(ROOT_ID);
      if (root) root.scrollTop = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pageStyle, props.pageNumber, props.lastPageNumber]);

  return (
    <>
      {/* {props.overlayPageNumber ? renderPageNumberOverlay() : <></>} */}
      <div
        ref={viewerContainer}
        className={`
          ${styles.container}
          ${props.hideScrollbar ? styles.noScrollbar : ''}`}
        onClick={
          props.pageStyle === PageStyle.LongStrip
            ? () => true
            : viewerContainerClickHandler
        }
      >
        {props.pageStyle === PageStyle.LongStrip
          ? getSeparatePageContainers()
          : getSinglePageContainer()}
      </div>
    </>
  );
};

export default connector(ReaderViewer);
