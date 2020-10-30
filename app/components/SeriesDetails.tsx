import React from 'react';
import { Typography, Button, Descriptions, Affix } from 'antd';
import Series from '../models/series';
import styles from './SeriesDetails.css';
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
      <Affix className={styles.backButtonAffix}>
        <Button onClick={() => props.seriesDetailsCallback()}>
          ◀ Back to library
        </Button>
      </Affix>
      <div className={styles.imageContainer}>
        <img src={exampleBackground} alt={props.series.title} />
      </div>
      <div className={styles.headerContainer}>
        <div>
          <img
            className={styles.coverImage}
            src={blankCover}
            alt={props.series.title}
          />
        </div>
        <div className={styles.headerDetailsContainer}>
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
