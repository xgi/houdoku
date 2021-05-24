/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import fs from 'fs';
import path from 'path';
import React from 'react';
import { Row, Col } from 'antd';
import { ipcRenderer } from 'electron';
import Title from 'antd/lib/typography/Title';
import { CheckOutlined } from '@ant-design/icons';
import { Series, SeriesStatus } from 'houdoku-extension-lib';
import { ProgressFilter } from '../../models/types';
import styles from './LibraryGrid.css';
import blankCover from '../../img/blank_cover.png';
import ipcChannels from '../../constants/ipcChannels.json';

const thumbnailsDir = await ipcRenderer.invoke(
  ipcChannels.GET_PATH.THUMBNAILS_DIR
);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  columns: number;
  seriesList: Series[];
  sorted: boolean;
  filter: string;
  filterStatus: SeriesStatus | null;
  filterProgress: ProgressFilter;
  filterUserTags: string[];
  clickFunc: (series: Series, inLibrary: boolean | undefined) => void;
  inLibraryFunc: ((series: Series) => boolean) | undefined;
};

const LibraryGrid: React.FC<Props> = (props: Props) => {
  /**
   * Get the cover image source of a series.
   * If the series id is non-undefined (i.e. it is in the user's library) we first try to find the
   * downloaded thumbnail image. If it doesn't exist, we return the blankCover path.
   * If the series id is undefined (i.e. it was included in search results, but is not yet in the
   * library), we attempt to use the series.remoteCoverUrl (defaulting to blankCover if it
   * isn't set).
   * @param series
   * @returns the cover image for a series, which can be put in an <img> tag
   */
  const getImageSource = (series: Series) => {
    let thumbnailPath: string;
    if (series.id !== undefined) {
      thumbnailPath = path.join(thumbnailsDir, `${series.id}.jpg`);
      if (!fs.existsSync(thumbnailPath)) {
        thumbnailPath = path.join(thumbnailsDir, `${series.id}.png`);
      }
      return fs.existsSync(thumbnailPath) ? thumbnailPath : blankCover;
    }

    return series.remoteCoverUrl === '' ? blankCover : series.remoteCoverUrl;
  };

  /**
   * Get a filtered (and sorted) list of series after applying the specified filters.
   * @param seriesList the list of series to filter
   * @returns a sorted list of series matching all filter props
   */
  const getFilteredList = (seriesList: Series[]): Series[] => {
    const filter = props.filter.toLowerCase();

    const filteredList = seriesList.filter((series: Series) => {
      if (!series.title.toLowerCase().includes(filter)) return false;
      if (props.filterStatus !== null && series.status !== props.filterStatus) {
        return false;
      }
      if (
        props.filterProgress === ProgressFilter.Unread &&
        series.numberUnread === 0
      ) {
        return false;
      }
      if (
        props.filterProgress === ProgressFilter.Finished &&
        series.numberUnread > 0
      ) {
        return false;
      }
      for (let i = 0; i < props.filterUserTags.length; i += 1) {
        if (!series.userTags.includes(props.filterUserTags[i])) return false;
      }

      return true;
    });

    return props.sorted
      ? filteredList.sort((a: Series, b: Series) =>
          a.title.localeCompare(b.title)
        )
      : filteredList;
  };

  /**
   * Render the "Unread" badge on a series.
   * This is a number in a red box at the top-left of the cover, showing the number of unread
   * chapters. This is based on series.numberUnread, which is a fairly naive value obtained by
   * subtracting the highest available chapter number by the latest read chapter number (rounded).
   * See comparison.getNumberUnreadChapters for more details.
   * @param series the series to generate the badge for
   * @returns an element to include in the cover container div
   */
  const renderUnreadBadge = (series: Series) => {
    if (series.numberUnread > 0) {
      return (
        <Title level={5} className={styles.seriesUnreadCount}>
          {series.numberUnread}
        </Title>
      );
    }
    return <></>;
  };

  /**
   * Render the "In Library" badge on a series.
   * This is a checkmark in a green box at the top-right of the cover. It is used if we have been
   * provided an inLibraryFund (particularly on the search page).
   * @returns an element to include in the cover container div
   */
  const renderInLibraryBadge = () => {
    return (
      <Title level={3} className={styles.seriesInLibrary}>
        <CheckOutlined />
      </Title>
    );
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        {getFilteredList(props.seriesList).map((series: Series) => {
          const coverSource = getImageSource(series).replaceAll('\\', '/');
          const inLibrary: boolean | undefined =
            props.inLibraryFunc === undefined
              ? undefined
              : props.inLibraryFunc(series);

          return (
            <Col span={24 / props.columns} key={`${series.id}-${series.title}`}>
              <div
                className={styles.coverContainer}
                onClick={() => props.clickFunc(series, inLibrary)}
                style={{
                  backgroundImage: `url(${coverSource})`,
                  height: `calc(105vw / ${props.columns})`,
                }}
              >
                {renderUnreadBadge(series)}
                {inLibrary ? renderInLibraryBadge() : ''}
                <Title level={5} className={styles.seriesTitle}>
                  {series.title}
                </Title>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default LibraryGrid;
