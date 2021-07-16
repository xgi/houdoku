import fs from 'fs';
import path from 'path';
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import {
  Typography,
  Button,
  Descriptions,
  Affix,
  Modal,
  Select,
  Checkbox,
  Form,
} from 'antd';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Paragraph from 'antd/lib/typography/Paragraph';
import { connect, ConnectedProps } from 'react-redux';
import {
  Chapter,
  ContentWarningKey,
  FormatKey,
  GenreKey,
  Series,
  ThemeKey,
  Languages,
  Genres,
  Themes,
  Formats,
  ContentWarnings,
} from 'houdoku-extension-lib';
import ChapterTable from './ChapterTable';
import styles from './SeriesDetails.css';
import blankCover from '../../img/blank_cover.png';
import routes from '../../constants/routes.json';
import db from '../../services/db';
import { getBannerImageUrl } from '../../services/mediasource';
import {
  setChapterList,
  setSeries,
  setSeriesBannerUrl,
} from '../../features/library/actions';
import {
  loadChapterList,
  loadSeries,
  loadSeriesList,
  reloadSeriesList,
  removeSeries,
  toggleChapterRead,
  updateSeriesUserTags,
  updateSeriesTrackerKeys,
} from '../../features/library/utils';
import { setStatusText } from '../../features/statusbar/actions';
import { RootState } from '../../store';
import ipcChannels from '../../constants/ipcChannels.json';
import SeriesTrackerModal from './SeriesTrackerModal';

const { Title } = Typography;
const { Option } = Select;

const thumbnailsDir = await ipcRenderer.invoke(
  ipcChannels.GET_PATH.THUMBNAILS_DIR
);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

const mapState = (state: RootState) => ({
  series: state.library.series,
  chapterList: state.library.chapterList,
  reloadingSeriesList: state.library.reloadingSeriesList,
  userTags: state.library.userTags,
  seriesBannerUrl: state.library.seriesBannerUrl,
  chapterLanguages: state.settings.chapterLanguages,
  trackerAutoUpdate: state.settings.trackerAutoUpdate,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setSeries: (series: Series) => dispatch(setSeries(series)),
  setChapterList: (chapterList: Chapter[]) =>
    dispatch(setChapterList(chapterList)),
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
  loadSeries: (id: number) => loadSeries(dispatch, id),
  loadSeriesList: () => loadSeriesList(dispatch),
  loadChapterList: (seriesId: number) => loadChapterList(dispatch, seriesId),
  reloadSeriesList: (seriesList: Series[], callback?: () => void) =>
    reloadSeriesList(dispatch, seriesList, callback),
  removeSeries: (series: Series, deleteDownloadedChapters: boolean) =>
    removeSeries(dispatch, series, deleteDownloadedChapters),
  toggleChapterRead: (chapter: Chapter, series: Series) =>
    toggleChapterRead(dispatch, chapter, series),
  updateSeriesUserTags: (
    series: Series,
    userTags: string[],
    callback: () => void
  ) => updateSeriesUserTags(series, userTags, callback),
  updateSeriesTrackerKeys: (
    series: Series,
    trackerKeys: { [trackerId: string]: string } | undefined,
    callback: () => void
  ) => updateSeriesTrackerKeys(series, trackerKeys, callback),
  setSeriesBannerUrl: (seriesBannerUrl: string | null) =>
    dispatch(setSeriesBannerUrl(seriesBannerUrl)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

interface ParamTypes {
  id: string;
}

const SeriesDetails: React.FC<Props> = (props: Props) => {
  const { id } = useParams<ParamTypes>();
  const history = useHistory();
  const [showingTrackerModal, setShowingTrackerModal] = useState(false);
  const [showingRemoveModal, setShowingRemoveModal] = useState(false);
  const [removalForm] = Form.useForm();

  const loadContent = async () => {
    log.debug(`Series page is loading details from database for series ${id}`);

    db.fetchSeries(parseInt(id, 10))
      .then((response: any) => {
        props.setSeries(response[0]);
        return getBannerImageUrl(response[0]);
      })
      .then((seriesBannerUrl: string | null) =>
        props.setSeriesBannerUrl(seriesBannerUrl)
      )
      .catch((err: Error) => log.error(err));

    props.loadChapterList(parseInt(id, 10));
  };

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (props.series === undefined) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  const getThumbnailPath = (seriesId?: number) => {
    const fileExtensions = ['jpg', 'png', 'jpeg'];
    for (let i = 0; i < fileExtensions.length; i += 1) {
      const thumbnailPath = path.join(
        thumbnailsDir,
        `${seriesId}.${fileExtensions[i]}`
      );
      if (fs.existsSync(thumbnailPath)) return thumbnailPath;
    }
    return blankCover;
  };

  const renderSeriesDescriptions = (series: Series) => {
    return (
      <Descriptions column={4}>
        <Descriptions.Item className={styles.descriptionItem} label="Author">
          {series.authors.join('; ')}
        </Descriptions.Item>
        <Descriptions.Item className={styles.descriptionItem} label="Artist">
          {series.artists.join('; ')}
        </Descriptions.Item>
        <Descriptions.Item className={styles.descriptionItem} label="Status">
          {series.status}
        </Descriptions.Item>
        <Descriptions.Item className={styles.descriptionItem} label="Language">
          {Languages[series.originalLanguageKey].name}
        </Descriptions.Item>
        <Descriptions.Item
          className={styles.descriptionItem}
          label="Genres"
          span={2}
        >
          {series.genres
            .map((genreKey: GenreKey) => Genres[genreKey].name)
            .join('; ')}
        </Descriptions.Item>
        <Descriptions.Item
          className={styles.descriptionItem}
          label="Themes"
          span={2}
        >
          {series.themes
            .map((themeKey: ThemeKey) => Themes[themeKey].name)
            .join('; ')}
        </Descriptions.Item>
        <Descriptions.Item
          className={styles.descriptionItem}
          label="Formats"
          span={2}
        >
          {series.formats
            .map((formatKey: FormatKey) => Formats[formatKey].name)
            .join('; ')}
        </Descriptions.Item>
        <Descriptions.Item
          className={styles.descriptionItem}
          label="Content Warnings"
          span={2}
        >
          {series.contentWarnings
            .map(
              (contentWarningKey: ContentWarningKey) =>
                ContentWarnings[contentWarningKey].name
            )
            .join('; ')}
        </Descriptions.Item>
        <Descriptions.Item
          className={styles.descriptionItem}
          label="User Tags"
          span={4}
        >
          <Select
            mode="tags"
            allowClear
            style={{ width: '100%' }}
            placeholder="Enter tags..."
            value={series.userTags}
            onChange={(userTags: string[]) =>
              props.updateSeriesUserTags(series, userTags, () =>
                props.setSeries({ ...series, userTags })
              )
            }
          >
            {props.userTags.map((userTag: string) => (
              <Option key={userTag} value={userTag}>
                {userTag}
              </Option>
            ))}
          </Select>
        </Descriptions.Item>
      </Descriptions>
    );
  };

  if (props.series === undefined) return <></>;

  return (
    <>
      <SeriesTrackerModal
        loadSeriesContent={() => loadContent()}
        series={props.series}
        visible={showingTrackerModal}
        toggleVisible={() => setShowingTrackerModal(!showingTrackerModal)}
      />
      <Modal
        visible={showingRemoveModal}
        title="Remove this series from your library?"
        onCancel={() => setShowingRemoveModal(false)}
        okText="Remove"
        okButtonProps={{ danger: true }}
        onOk={() => {
          removalForm
            .validateFields()
            .then((values) => {
              // eslint-disable-next-line promise/always-return
              if (props.series !== undefined) {
                log.info(`Removing series ${props.series.id}`);
                props.removeSeries(props.series, values.deleteDownloads);
                history.push(routes.LIBRARY);
              }
            })
            .catch((info) => {
              log.error(info);
            });
        }}
      >
        <Form
          form={removalForm}
          name="removal_form"
          initialValues={{ deleteDownloads: false }}
        >
          <Paragraph>This action is irreversible.</Paragraph>
          <Form.Item
            className={styles.formItem}
            name="deleteDownloads"
            valuePropName="checked"
          >
            <Checkbox>Delete downloaded episodes</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
      <Link to={routes.LIBRARY}>
        <Affix className={styles.backButtonAffix}>
          <Button onClick={() => props.loadSeriesList()}>
            ◀ Back to library
          </Button>
        </Affix>
      </Link>
      <div className={styles.backgroundContainer}>
        {props.seriesBannerUrl === null ? (
          <></>
        ) : (
          <img src={props.seriesBannerUrl} alt={props.series.title} />
        )}
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
          <div className={styles.headerTitleRow}>
            <Title level={4}>{props.series.title}</Title>
            <div className={styles.headerTitleSpacer} />
            <Button
              className={styles.removeButton}
              onClick={() => setShowingRemoveModal(true)}
            >
              Remove Series
            </Button>
            <Button onClick={() => setShowingTrackerModal(true)}>
              Trackers
            </Button>
            <Button
              type="primary"
              className={styles.refreshButton}
              onClick={() => {
                if (props.series !== undefined && !props.reloadingSeriesList)
                  props.reloadSeriesList([props.series], loadContent);
              }}
            >
              {props.reloadingSeriesList ? <SyncOutlined spin /> : 'Refresh'}
            </Button>
          </div>
          <Paragraph ellipsis={{ rows: 5, expandable: true, symbol: 'more' }}>
            {props.series.description}
          </Paragraph>
        </div>
      </div>
      {renderSeriesDescriptions(props.series)}
      <ChapterTable series={props.series} />
    </>
  );
};

export default connector(SeriesDetails);
