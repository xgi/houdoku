/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import fs from 'fs';
import path from 'path';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Row, Col, Button } from 'antd';
import { ipcRenderer } from 'electron';
import Title from 'antd/lib/typography/Title';
import { Series } from '../models/types';
import styles from './LibraryGrid.css';
import routes from '../constants/routes.json';
import blankCover from '../img/blank_cover.png';

const thumbnailsDir = await ipcRenderer.invoke('get-thumbnails-dir');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  columns: number;
  seriesList: Series[];
};

const LibraryGrid: React.FC<Props> = (props: Props) => {
  const history = useHistory();

  const getThumbnailPath = (id?: number) => {
    const thumbnailPath = path.join(thumbnailsDir, `${id}.jpg`);
    return fs.existsSync(thumbnailPath) ? thumbnailPath : blankCover;
  };

  const goToSeries = (seriesId: number | undefined) => {
    if (seriesId !== undefined) history.push(`${routes.SERIES}/${seriesId}`);
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        {props.seriesList.map((series: Series) => {
          return (
            <Col span={24 / props.columns} key={series.id}>
              <div
                className={styles.coverContainer}
                onClick={() => goToSeries(series.id)}
              >
                <img
                  src={getThumbnailPath(series.id)}
                  alt={series.toString()}
                  className={styles.coverImage}
                />
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
