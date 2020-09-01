import React from 'react';
import { Typography, Button } from 'antd';
import Series from '../models/series';

type Props = {
  series: Series;
  seriesDetailsCallback: (series?: Series) => void;
};

const SeriesDetails: React.FC<Props> = (props: Props) => {
  return (
    <div>
      <Typography>{props.series.title}</Typography>
      <Button onClick={() => props.seriesDetailsCallback()}>
        back to library
      </Button>
    </div>
  );
};

export default SeriesDetails;
