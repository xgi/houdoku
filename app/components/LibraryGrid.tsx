import React from 'react';
import { Row, Col } from 'antd';
import blankCover from '../img/blank_cover.png';
import Series from '../models/series';

type Props = {
  columns: number;
  seriesList: Series[];
};

const LibraryGrid: React.FC<Props> = (props: Props) => {
  const { columns, seriesList } = props;

  return (
    <div>
      <Row gutter={[16, 16]}>
        {seriesList.map((series: Series) => {
          return (
            <Col span={24 / columns} key={series.uuid}>
              <img
                src={blankCover}
                alt={series.toString()}
                title={series.name}
                style={{ width: '100%' }}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default LibraryGrid;
