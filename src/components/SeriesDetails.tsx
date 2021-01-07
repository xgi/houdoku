import fs from 'fs';
import path from 'path';
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Typography, Button, Descriptions, Affix } from 'antd';
import { ipcRenderer } from 'electron';
import Paragraph from 'antd/lib/typography/Paragraph';
import ChapterTable from './ChapterTable';
import {
  Chapter,
  ContentWarning,
  Format,
  Genre,
  Language,
  Series,
  SeriesStatus,
  Theme,
} from '../models/types';
import styles from './SeriesDetails.css';
import exampleBackground from '../img/example_bg2.jpg';
import blankCover from '../img/blank_cover.png';
import routes from '../constants/routes.json';

const { Title } = Typography;

const thumbnailsDir = await ipcRenderer.invoke('get-thumbnails-dir');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  series: Series | undefined;
  chapterList: Chapter[];
  loadSeries: (id: number) => void;
  loadChapterList: (seriesId: number) => void;
};

const SeriesDetails: React.FC<Props> = (props: Props) => {
  const { id } = useParams();

  useEffect(() => {
    props.loadSeries(id);
    props.loadChapterList(id);
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

  const renderSeriesDescriptions = (series: Series) => {
    return (
      <Descriptions column={4}>
        <Descriptions.Item label="Author">
          {series.authors.join(';')}
        </Descriptions.Item>
        <Descriptions.Item label="Artist">
          {series.artists.join(';')}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {SeriesStatus[series.status]}
        </Descriptions.Item>
        <Descriptions.Item label="Language">
          {Language[series.originalLanguage]}
        </Descriptions.Item>
        <Descriptions.Item label="Genres" span={2}>
          {series.genres.map((genre: Genre) => Genre[genre]).join('; ')}
        </Descriptions.Item>
        <Descriptions.Item label="Themes" span={2}>
          {series.themes.map((theme: Theme) => Theme[theme]).join('; ')}
        </Descriptions.Item>
        <Descriptions.Item label="Formats" span={2}>
          {series.formats.map((format: Format) => Format[format]).join('; ')}
        </Descriptions.Item>
        <Descriptions.Item label="Content Warnings" span={2}>
          {series.contentWarnings
            .map(
              (contentWarning: ContentWarning) => ContentWarning[contentWarning]
            )
            .join('; ')}
        </Descriptions.Item>
      </Descriptions>
    );
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
          <Paragraph ellipsis={{ rows: 5, expandable: true, symbol: 'more' }}>
            {props.series.description}
          </Paragraph>
        </div>
      </div>
      {props.series !== undefined ? renderSeriesDescriptions(props.series) : ''}
      <ChapterTable chapterList={props.chapterList} />
    </div>
  );
};

export default SeriesDetails;
