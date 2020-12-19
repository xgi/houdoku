import fs from 'fs';
import path from 'path';
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Typography, Button, Descriptions, Affix } from 'antd';
import ChapterTable from './ChapterTable';
import { Chapter, Series } from '../models/types';
import styles from './SeriesDetails.css';
import exampleBackground from '../img/example_bg2.jpg';
import blankCover from '../img/blank_cover.png';
import routes from '../constants/routes.json';

const { app } = require('electron').remote;
const { Title } = Typography;

const thumbnailsDir = path.join(app.getPath('userData'), 'thumbnails');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  series: Series | undefined;
  chapterList: Chapter[];
  fetchSeries: (id: number) => void;
  fetchChapterList: (seriesId: number) => void;
};

const SeriesDetails: React.FC<Props> = (props: Props) => {
  const { id } = useParams();

  useEffect(() => {
    props.fetchSeries(id);
    props.fetchChapterList(id);
  }, []);

  if (props.series === undefined) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  const getThumbnailPath = (seriesId?: number) => {
    const thumbnailPath = path.join(thumbnailsDir, `${id}.jpg`);
    return fs.existsSync(thumbnailPath) ? thumbnailPath : blankCover;
  };

  return (
    <div>
      <Link to={routes.LIBRARY}>
        <Affix className={styles.backButtonAffix}>
          <Button>◀ Back to library</Button>
        </Affix>
      </Link>
      <div className={styles.imageContainer}>
        <img src={exampleBackground} alt={props.series.title} />
      </div>
      <div className={styles.headerContainer}>
        <div>
          <img
            className={styles.coverImage}
            src={getThumbnailPath(props.series.id)}
            alt={props.series.title}
          />
        </div>
        <div className={styles.headerDetailsContainer}>
          <Title level={4}>{props.series.title}</Title>
          {/* <Paragraph ellipsis={{ rows: 5, expandable: true, symbol: 'more' }}>
            {series.description}
          </Paragraph> */}
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
      <ChapterTable chapterList={props.chapterList} />
    </div>
  );
};

export default SeriesDetails;
