import fs from 'fs';
import path from 'path';
import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button } from 'antd';
import blankCover from '../img/blank_cover.png';
import { Series } from '../models/types';
import styles from './LibraryGrid.css';
import routes from '../constants/routes.json';

const { app } = require('electron').remote;

const thumbnailsDir = path.join(app.getPath('userData'), 'thumbnails');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  columns: number;
  seriesList: Series[];
};

const LibraryGrid: React.FC<Props> = (props: Props) => {
  const getThumbnailPath = (id?: number) => {
    const thumbnailPath = path.join(thumbnailsDir, `${id}.jpg`);
    return fs.existsSync(thumbnailPath) ? thumbnailPath : blankCover;
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        {props.seriesList.map((series: Series) => {
          return (
            <Col span={24 / props.columns} key={series.id}>
              <img
                src={getThumbnailPath(series.id)}
                alt={series.toString()}
                title={series.title}
                className={styles.coverImage}
              />
              <Link to={`${routes.SERIES}/${series.id}`}>
                <Button>details</Button>
              </Link>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default LibraryGrid;
