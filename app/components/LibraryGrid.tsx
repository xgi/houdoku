import React from 'react';
import { Row, Col, Button } from 'antd';
import blankCover from '../img/blank_cover.png';
import Series from '../models/series';

type Props = {
  columns: number;
  seriesList: Series[];
  seriesDetailsCallback: (series?: Series) => void;
};

const LibraryGrid: React.FC<Props> = (props: Props) => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        {props.seriesList.map((series: Series) => {
          return (
            <Col span={24 / props.columns} key={series.uuid}>
              <img
                src={blankCover}
                alt={series.toString()}
                title={series.title}
                style={{ width: '100%' }}
              />
              <Button onClick={() => props.seriesDetailsCallback(series)}>
                details
              </Button>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default LibraryGrid;
