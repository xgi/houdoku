import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Typography, Button, Descriptions, Affix } from 'antd';
import ChapterTable from './ChapterTable';
import Library from '../models/Library';
import Series from '../models/series';
import styles from './SeriesDetails.css';
import exampleBackground from '../img/example_bg2.jpg';
import blankCover from '../img/blank_cover.png';
import routes from '../constants/routes.json';
import Chapter from '../models/chapter';

const { Title, Paragraph } = Typography;

type Props = {
  library: Library;
};

const SeriesDetails: React.FC<Props> = (props: Props) => {
  const { uuid } = useParams();
  const series: Series = props.library.seriesList.find((s) => s.uuid === uuid);

  return (
    <div>
      <Link to={routes.LIBRARY}>
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
      <Descriptions column={4}>
        <Descriptions.Item label="Author">Arakawa Naoshi</Descriptions.Item>
        <Descriptions.Item label="Artist">Arakawa Naoshi</Descriptions.Item>
        <Descriptions.Item label="Status">Completed</Descriptions.Item>
        <Descriptions.Item label="Chapters">44</Descriptions.Item>
        <Descriptions.Item label="Genres">
          Award Winning, Comedy, Drama, Music, Romance, School Life, Slice of
          Life, Tragedy
        </Descriptions.Item>
      </Descriptions>
      <ChapterTable chapterList={series.chapterList} />
    </div>
  );
};

export default SeriesDetails;
