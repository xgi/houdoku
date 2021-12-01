/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../store';
import styles from './ReaderViewer.css';
import { ReadingDirection, PageStyle } from '../../models/types';
import { changePageNumber, setPageNumber } from '../../features/reader/actions';

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
  changePageNumber: (delta: number) => dispatch(changePageNumber(delta)),
  setPageNumber: (pageNumber: number) => dispatch(setPageNumber(pageNumber)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderViewer: React.FC<Props> = (props: Props) => {
  const viewerContainer = useRef<HTMLDivElement>(null);
  const [skipChangePageNumEffect, setSkipChangePageNumEffect] = useState(false);

  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.onscroll = () => {
        if (viewerContainer.current) {
          let imageHeightSum = 0;

          let childNum = 0;
          for (
            childNum = 0;
            childNum < viewerContainer.current.children.length &&
            imageHeightSum < root.scrollTop + root.clientHeight - 54;
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.lastPageNumber, props.pageNumber]);

  // const viewerContainerClickHandler = (e: any) => {
  //   const rect: DOMRect = e.target.getBoundingClientRect();
  //   const relX = e.clientX - rect.left;

  //   if (relX > rect.width * 0.6) {
  //     props.changePageNumber(
  //       props.layoutDirection === LayoutDirection.LeftToRight ? 1 : -1
  //     );
  //   } else if (relX < rect.width * 0.4) {
  //     props.changePageNumber(
  //       props.layoutDirection === LayoutDirection.LeftToRight ? -1 : 1
  //     );
  //   }
  // };

  const getVerticalPages = () => {
    const pageContainers = [];
    for (let i = 1; i <= props.lastPageNumber; i += 1) {
      pageContainers.push(
        <div
          id={`pageContainer-${i}`}
          className={`
            ${styles.page}
            ${props.fitContainToWidth ? styles.containWidth : ''}
            ${props.fitContainToHeight ? styles.containHeight : ''}
            ${props.fitStretch ? styles.grow : ''}
          `}
        >
          <img
            src={props.pageDataList[i - 1]}
            alt={`Page ${i}`}
            className={`
              ${styles.pageImage}
              ${props.fitContainToWidth ? styles.containWidth : ''}
              ${props.fitContainToHeight ? styles.containHeight : ''}
              ${props.fitStretch ? styles.grow : ''}
            `}
          />
        </div>
      );
    }

    return pageContainers;
  };

  useEffect(() => {
    if (skipChangePageNumEffect) {
      setSkipChangePageNumEffect(false);
    } else if (viewerContainer.current) {
      const elem = viewerContainer.current.children[props.pageNumber - 1];
      if (elem !== undefined) {
        elem.scrollIntoView();

        // if we're not scrolling to the last page, need to scroll up some
        // since the image is covered by the header
        const root = document.getElementById('root');
        if (root && props.pageNumber < props.lastPageNumber) {
          root.scrollTop -= 54;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pageNumber, props.lastPageNumber]);

  return (
    <>
      {/* {props.overlayPageNumber ? renderPageNumberOverlay() : <></>} */}
      <div
        ref={viewerContainer}
        className={`
          ${styles.container}
          ${props.hideScrollbar ? styles.noScrollbar : ''}`}
      >
        {/* {getPageContainers()} */}
        {getVerticalPages()}
        {/* <div className={`${styles.page} ${styles.containWidth} ${styles.grow}`}>
          <img
            src={props.pageDataList[props.pageNumber - 1]}
            alt={`Page ${props.pageNumber}`}
            className={`${styles.pageImage} ${styles.containWidth} ${styles.grow}`}
          />
        </div> */}
      </div>
    </>
  );
};

export default connector(ReaderViewer);
