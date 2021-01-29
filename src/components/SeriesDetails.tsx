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
  Series,
  SeriesStatus,
  Theme,
} from '../models/types';
import { Languages } from '../models/languages';
import styles from './SeriesDetails.css';
import exampleBackground from '../img/example_bg2.jpg';
import blankCover from '../img/blank_cover.png';
import routes from '../constants/routes.json';
import { getChapters, getSeries } from '../services/extension';
import db from '../services/db';

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
  setStatusText: (text?: string) => void;
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

  const reloadSeries = async () => {
    if (props.series === undefined || props.series.id === undefined) return;

    props.setStatusText(`Reloading series "${props.series.title}"...`);
    const series: Series = await getSeries(
      props.series.extensionId,
      props.series.sourceId
    );
    const newChapters: Chapter[] = await getChapters(
      props.series.extensionId,
      props.series.sourceId
    );

    series.id = props.series.id;
    const oldChapters: Chapter[] = await db.fetchChapters(series.id);

    const chapters: Chapter[] = newChapters.map((chapter: Chapter) => {
      const matchingChapter: Chapter | undefined = oldChapters.find(
        (c: Chapter) => c.sourceId === chapter.sourceId
      );
      if (matchingChapter !== undefined) {
        chapter.id = matchingChapter.id;
      }
      return chapter;
    });

    await db.addSeries(series);
    await db.addChapters(chapters, series);
    props.setStatusText(`Finished reloading series "${props.series.title}".`);
  };

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
          {Languages[series.originalLanguageKey].name}
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
      <Affix className={styles.refreshButtonAffix}>
        <Button onClick={() => reloadSeries()}>
          <span className="icon-spinner11" />
          &nbsp;Refresh
        </Button>
      </Affix>
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
