import React from 'react';
import { Typography, Button, Descriptions, Affix } from 'antd';
import Series from '../models/series';
import exampleBackground from '../img/example_bg2.jpg';
import blankCover from '../img/blank_cover.png';

const { Title, Paragraph } = Typography;

type Props = {
  series: Series;
  seriesDetailsCallback: (series?: Series) => void;
};

const SeriesDetails: React.FC<Props> = (props: Props) => {
  return (
    <div>
      <Affix style={{ position: 'absolute', top: 5 }}>
        <Button onClick={() => props.seriesDetailsCallback()}>
          ◀ Back to library
        </Button>
      </Affix>
      <div
        style={{
          width: 'auto',
          height: 180,
          overflow: 'hidden',
          margin: '0 -16px 0 -16px',
        }}
      >
        <img
          src={exampleBackground}
          alt={props.series.title}
          style={{
            objectFit: 'cover',
            height: '100%',
            width: '100%',
          }}
        />
      </div>
      <div
        style={{
          display: 'grid',
          gridColumnGap: 16,
          gridTemplateColumns: '150px auto',
        }}
      >
        <div>
          <img
            src={blankCover}
            alt={props.series.title}
            style={{ marginTop: -70, width: '100%' }}
          />
        </div>
        <div style={{ paddingTop: 15 }}>
          <Title level={4}>{props.series.title}</Title>
          <Paragraph ellipsis={{ rows: 5, expandable: true, symbol: 'more' }}>
            {props.series.description}
          </Paragraph>
        </div>
      </div>
      <Descriptions>
        <Descriptions.Item label="UserName">Zhou Maomao</Descriptions.Item>
        <Descriptions.Item label="Telephone">1810000000</Descriptions.Item>
        <Descriptions.Item label="Live">Hangzhou, Zhejiang</Descriptions.Item>
        <Descriptions.Item label="Remark">empty</Descriptions.Item>
        <Descriptions.Item label="Address">
          No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China
        </Descriptions.Item>
      </Descriptions>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
      <Typography>laksdjalksjd</Typography>
    </div>
  );
};

export default SeriesDetails;
