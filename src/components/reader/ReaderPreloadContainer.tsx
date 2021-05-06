import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../store';
import styles from './ReaderPreloadContainer.css';

const mapState = (state: RootState) => ({
  pageNumber: state.reader.pageNumber,
  lastPageNumber: state.reader.lastPageNumber,
  pageUrls: state.reader.pageUrls,
  pageDataList: state.reader.pageDataList,
  series: state.reader.series,
  preloadAmount: state.settings.preloadAmount,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderPreloadContainer: React.FC<Props> = (props: Props) => {
  const renderPreloadContainer = () => {
    if (props.series === undefined) return <></>;
    if (props.pageUrls.length === 0) return <></>;

    const images = [];

    for (
      let i = props.pageNumber;
      i < props.lastPageNumber && i < props.pageNumber + props.preloadAmount;
      i += 1
    ) {
      images.push(
        <img src={props.pageDataList[i]} alt="pagepreload" key={i} />
      );
    }

    return <div className={styles.preloadContainer}>{images}</div>;
  };

  return <>{renderPreloadContainer()}</>;
};

export default connector(ReaderPreloadContainer);
