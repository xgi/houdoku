import fs from 'fs';
import path from 'path';
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Typography, Button, Descriptions, Affix } from 'antd';
import { ipcRenderer } from 'electron';
import { ReloadOutlined, LoadingOutlined } from '@ant-design/icons';
import Paragraph from 'antd/lib/typography/Paragraph';
import { connect, ConnectedProps } from 'react-redux';
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
import { getBannerImageUrl } from '../services/mediasource';
import {
  setChapterList,
  setSeries,
  setSeriesBannerUrl,
} from '../features/library/actions';
import {
  loadChapterList,
  loadSeries,
  toggleChapterRead,
} from '../features/library/utils';
import { setStatusText } from '../features/statusbar/actions';
import { RootState } from '../store';

const { Title } = Typography;

const thumbnailsDir = await ipcRenderer.invoke('get-thumbnails-dir');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

const mapState = (state: RootState) => ({
  series: state.library.series,
  chapterList: state.library.chapterList,
  seriesBannerUrl: state.library.seriesBannerUrl,
  chapterLanguages: state.settings.chapterLanguages,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setSeries: (series: Series) => dispatch(setSeries(series)),
  setChapterList: (chapterList: Chapter[]) =>
    dispatch(setChapterList(chapterList)),
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
  loadSeries: (id: number) => loadSeries(dispatch, id),
  loadChapterList: (seriesId: number) => loadChapterList(dispatch, seriesId),
  toggleChapterRead: (chapter: Chapter, series: Series) =>
    toggleChapterRead(dispatch, chapter, series),
  setSeriesBannerUrl: (seriesBannerUrl: string | null) =>
    dispatch(setSeriesBannerUrl(seriesBannerUrl)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const SeriesDetails: React.FC<Props> = (props: Props) => {
  const { id } = useParams();

  const loadContent = async () => {
    // eslint-disable-next-line promise/catch-or-return
    db.fetchSeries(id)
      .then((response: any) => {
        props.setSeries(response[0]);
        return getBannerImageUrl(response[0]);
      })
      .then((seriesBannerUrl: string) =>
        props.setSeriesBannerUrl(seriesBannerUrl)
      );

    props.loadChapterList(id);
  };

  useEffect(() => {
    loadContent();
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
    await db.updateSeriesNumberUnread(series);
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
        <Button icon={<ReloadOutlined />} onClick={() => reloadSeries()}>
          Refresh
        </Button>
      </Affix>
      <div className={styles.imageContainer}>
        <img
          src={
            props.seriesBannerUrl === null
              ? exampleBackground
              : props.seriesBannerUrl
          }
          alt={props.series.title}
        />
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
      <ChapterTable
        chapterList={props.chapterList}
        series={props.series}
        defaultChapterLanguages={props.chapterLanguages}
        toggleChapterRead={props.toggleChapterRead}
      />
    </div>
  );
};

export default connector(SeriesDetails);
