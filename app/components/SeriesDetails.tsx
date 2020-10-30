import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Typography, Button, Descriptions, Affix } from 'antd';
import Library from '../models/Library';
import Series from '../models/series';
import styles from './SeriesDetails.css';
import exampleBackground from '../img/example_bg2.jpg';
import blankCover from '../img/blank_cover.png';
import routes from '../constants/routes.json';

const { Title, Paragraph } = Typography;

type Props = {
  library: Library;
};

const SeriesDetails: React.FC<Props> = (props: Props) => {
  const { uuid } = useParams();
  const series: Series = props.library.seriesList.find((s) => s.uuid === uuid);

  return (
    <div>
      <Link to={routes.DASHBOARD}>
        <Affix className={styles.backButtonAffix}>
          <Button>◀ Back to library</Button>
        </Affix>
      </Link>
      <div className={styles.imageContainer}>
        <img src={exampleBackground} alt={series.title} />
      </div>
      <div className={styles.headerContainer}>
        <div>
          <img
            className={styles.coverImage}
            src={blankCover}
            alt={series.title}
          />
        </div>
        <div className={styles.headerDetailsContainer}>
          <Title level={4}>{series.title}</Title>
          <Paragraph ellipsis={{ rows: 5, expandable: true, symbol: 'more' }}>
            {series.description}
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
      <Link to={routes.DASHBOARD}>templink</Link>
    </div>
  );
};

export default SeriesDetails;
