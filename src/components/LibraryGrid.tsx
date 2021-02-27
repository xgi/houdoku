/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import fs from 'fs';
import path from 'path';
import React from 'react';
import { Row, Col } from 'antd';
import { ipcRenderer } from 'electron';
import Title from 'antd/lib/typography/Title';
import { CheckOutlined } from '@ant-design/icons';
import { Series } from '../models/types';
import styles from './LibraryGrid.css';
import blankCover from '../img/blank_cover.png';

const thumbnailsDir = await ipcRenderer.invoke('get-thumbnails-dir');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  columns: number;
  seriesList: Series[];
  filter: string;
  clickFunc: (series: Series, inLibrary: boolean | undefined) => void;
  inLibraryFunc: ((series: Series) => boolean) | undefined;
};

const LibraryGrid: React.FC<Props> = (props: Props) => {
  const getImageSource = (series: Series) => {
    let thumbnailPath: string;
    if (series.id !== undefined) {
      thumbnailPath = path.join(thumbnailsDir, `${series.id}.jpg`);
      return fs.existsSync(thumbnailPath) ? thumbnailPath : blankCover;
    }

    return series.remoteCoverUrl;
  };

  const getFilteredList = (seriesList: Series[]): Series[] => {
    const filter = props.filter.toLowerCase();

    return seriesList.filter((series: Series) => {
      if (series.title.toLowerCase().includes(filter)) return true;
      return false;
    });
  };

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
