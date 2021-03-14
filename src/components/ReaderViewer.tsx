import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Layout } from 'antd';
import { RootState } from '../store';
import styles from './ReaderViewer.css';
import { LayoutDirection, PageFit, PageView } from '../models/types';

const { Content } = Layout;

const mapState = (state: RootState) => ({
  pageNumber: state.reader.pageNumber,
  lastPageNumber: state.reader.lastPageNumber,
  pageUrls: state.reader.pageUrls,
  pageDataList: state.reader.pageDataList,
  series: state.reader.series,
  pageFit: state.settings.pageFit,
  pageView: state.settings.pageView,
  layoutDirection: state.settings.layoutDirection,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderViewer: React.FC<Props> = (props: Props) => {
  const getPageMargin = () => {
    return `${props.pageNumber * -100 + 100}%`;
  };

  const renderPageImage = (pageNumber: number) => {
    if (props.series === undefined) return <></>;
    if (props.pageUrls.length === 0) return <></>;

    return pageNumber <= props.lastPageNumber && pageNumber > 0 ? (
      <img
        className={styles.pageImage}
        src={props.pageDataList[pageNumber - 1]}
        alt={`page${pageNumber}`}
        loading="lazy"
      />
    ) : (
      <img className={styles.pageImage} src="data:," alt="" />
    );
  };

  const renderTwoPageLayout = (pageNumber: number) => {
    const firstPageNumber =
      props.pageView === PageView.Double_OddStart ? pageNumber - 1 : pageNumber;
    return (
      <>
        <span className={styles.imageColumn}>
          {renderPageImage(
            props.layoutDirection === LayoutDirection.LeftToRight
              ? firstPageNumber
              : firstPageNumber + 1
          )}
        </span>
        <span className={styles.imageColumn}>
          {renderPageImage(
            props.layoutDirection === LayoutDirection.LeftToRight
              ? firstPageNumber + 1
              : firstPageNumber
          )}
        </span>
      </>
    );
  };

  const renderViewer = () => {
    const imageWrappers = [];

    for (let i = 1; i <= props.lastPageNumber; i += 1) {
      imageWrappers.push(
        <Content
          key={i}
          className={`${styles.imageWrapper}
            ${props.pageFit === PageFit.Auto ? styles.fitAuto : ''}
            ${props.pageFit === PageFit.Width ? styles.fitWidth : ''}
            ${props.pageFit === PageFit.Height ? styles.fitHeight : ''}
          `}
          style={{ marginLeft: i === 1 ? getPageMargin() : 0 }}
        >
          {props.pageView === PageView.Single
            ? renderPageImage(i)
            : renderTwoPageLayout(i)}
        </Content>
      );
    }

    return <div className={styles.viewerContainer}>{imageWrappers}</div>;
  };

  return <>{renderViewer()}</>;
};

export default connector(ReaderViewer);
