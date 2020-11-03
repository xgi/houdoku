import React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button } from 'antd';
import blankCover from '../img/blank_cover.png';
import { Series } from '../models/types';
import styles from './LibraryGrid.css';
import routes from '../constants/routes.json';

type Props = {
  columns: number;
  seriesList: Series[];
};

const LibraryGrid: React.FC<Props> = (props: Props) => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        {props.seriesList.map((series: Series) => {
          return (
            <Col span={24 / props.columns} key={series.id}>
              <img
                src={blankCover}
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
