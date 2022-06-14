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
  Checkbox,
  Form,
  Tag,
  Dropdown,
  Menu,
  InputNumber,
} from 'antd';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import Paragraph from 'antd/lib/typography/Paragraph';
import { connect, ConnectedProps } from 'react-redux';
import {
  Chapter,
  Series,
  Languages,
  ExtensionMetadata,
} from 'houdoku-extension-lib';
import ChapterTable from './ChapterTable';
import styles from './SeriesDetails.css';
import blankCover from '../../img/blank_cover.png';
import routes from '../../constants/routes.json';
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
} from '../../features/library/utils';
import { setStatusText } from '../../features/statusbar/actions';
import { downloadChapters } from '../../features/downloader/actions';
import { RootState } from '../../store';
import ipcChannels from '../../constants/ipcChannels.json';
import SeriesTrackerModal from './SeriesTrackerModal';
import { FS_METADATA } from '../../services/extensions/filesystem';
import EditSeriesModal from './EditSeriesModal';
import { deleteThumbnail, getChapterDownloaded } from '../../util/filesystem';
import { downloadCover } from '../../util/download';
import library from '../../services/library';
import { DownloadTask } from '../../services/downloader';
import constants from '../../constants/constants.json';

const { Title } = Typography;
const { confirm } = Modal;

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
  seriesBannerUrl: state.library.seriesBannerUrl,
  chapterFilterTitle: state.library.chapterFilterTitle,
  chapterFilterGroup: state.library.chapterFilterGroup,
  chapterLanguages: state.settings.chapterLanguages,
  trackerAutoUpdate: state.settings.trackerAutoUpdate,
  customDownloadsDir: state.settings.customDownloadsDir,
});

const defaultDownloadsDir = await ipcRenderer.invoke(
  ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setSeries: (series: Series) => dispatch(setSeries(series)),
  setChapterList: (chapterList: Chapter[]) =>
    dispatch(setChapterList(chapterList)),
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
  loadSeries: (seriesId: string) => loadSeries(dispatch, seriesId),
  loadSeriesList: () => loadSeriesList(dispatch),
  loadChapterList: (seriesId: string) => loadChapterList(dispatch, seriesId),
  reloadSeriesList: (seriesList: Series[], callback?: () => void) =>
    reloadSeriesList(dispatch, seriesList, callback),
  removeSeries: (
    series: Series,
    deleteDownloadedChapters: boolean,
    downloadsDir: string
  ) => removeSeries(dispatch, series, deleteDownloadedChapters, downloadsDir),
  setSeriesBannerUrl: (seriesBannerUrl: string | null) =>
    dispatch(setSeriesBannerUrl(seriesBannerUrl)),
  downloadChapters: (tasks: DownloadTask[]) =>
    dispatch(downloadChapters(tasks)),
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
  const [extensionMetadata, setExtensionMetadata] = useState<
    ExtensionMetadata | undefined
  >();
  const [showingTrackerModal, setShowingTrackerModal] = useState(false);
  const [showingRemoveModal, setShowingRemoveModal] = useState(false);
  const [showingEditModal, setShowingEditModal] = useState(false);
  const [showingDownloadXModal, setShowingDownloadXModal] = useState(false);
  const [removalForm] = Form.useForm();
  const [downloadXForm] = Form.useForm();

  const loadContent = async () => {
    log.debug(`Series page is loading details from database for series ${id}`);

    const series: Series | null = library.fetchSeries(id);
    if (series === null) return;

    props.setSeries(series);
    props.loadChapterList(id);

    setExtensionMetadata(
      await ipcRenderer.invoke(
        ipcChannels.EXTENSION_MANAGER.GET,
        series.extensionId
      )
    );

    getBannerImageUrl(series)
      .then((seriesBannerUrl: string | null) =>
        props.setSeriesBannerUrl(seriesBannerUrl)
      )
      .catch((err: Error) => log.error(err));
  };

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (props.series === undefined) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  const getThumbnailPath = (seriesId?: string) => {
    const fileExtensions = constants.IMAGE_EXTENSIONS;
    for (let i = 0; i < fileExtensions.length; i += 1) {
      const thumbnailPath = path.join(
        thumbnailsDir,
        `${seriesId}.${fileExtensions[i]}`
      );
      if (fs.existsSync(thumbnailPath)) return thumbnailPath;
    }
    return blankCover;
  };

  const getSortedFilteredChapterList = () => {
    return props.chapterList
      .filter(
        (chapter: Chapter) =>
          (props.chapterLanguages.includes(chapter.languageKey) ||
            props.chapterLanguages.length === 0) &&
          chapter.title.toLowerCase().includes(props.chapterFilterTitle) &&
          chapter.groupName.toLowerCase().includes(props.chapterFilterGroup)
      )
      .sort(
        (a: Chapter, b: Chapter) =>
          parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber)
      );
  };

  const handleDownloadChapters = (
    chapters: Chapter[],
    largeAmountWarning = true
  ) => {
    if (props.series === undefined) return;

    const queue: Chapter[] = [];
    for (const chapter of chapters) {
      if (
        !getChapterDownloaded(
          props.series,
          chapter,
          props.customDownloadsDir || defaultDownloadsDir
        )
      ) {
        queue.push(chapter);
      }
    }

    const func = () => {
      props.downloadChapters(
        queue.map(
          (chapter: Chapter) =>
            ({
              chapter,
              series: props.series,
              downloadsDir: props.customDownloadsDir || defaultDownloadsDir,
            } as DownloadTask)
        )
      );
    };

    if (queue.length >= 3 && largeAmountWarning) {
      confirm({
        title: `Download ${queue.length} chapters?`,
        icon: <ExclamationCircleOutlined />,
        content:
          'You can view, pause, or cancel from the Downloads tab on the left.',
        onOk() {
          func();
        },
      });
    } else {
      func();
    }
  };

  const getNextChaptersToDownload = (amount: number) => {
    const result: Chapter[] = [];
    let prevChapterNumber = -1;

    const sortedList = getSortedFilteredChapterList();
    const startIndex = sortedList.map((c) => c.read).lastIndexOf(true);
    sortedList
      .slice(startIndex === -1 ? 0 : startIndex + 1)
      .every((chapter) => {
        if (props.series === undefined) return false;

        const chapterNumber = parseFloat(chapter.chapterNumber);
        const isDownloaded = getChapterDownloaded(
          props.series,
          chapter,
          props.customDownloadsDir || defaultDownloadsDir
        );

        if (!isDownloaded && chapterNumber > prevChapterNumber) {
          result.push(chapter);
          prevChapterNumber = chapterNumber;
        }

        // stop iterating once we have enough chapters by returning false
        return amount > result.length;
      });

    return result;
  };

  const renderSeriesDescriptions = (series: Series) => {
    const language = Languages[series.originalLanguageKey];
    const languageStr =
      language !== undefined && 'name' in language ? language.name : '';

    return (
      <Descriptions className={styles.descriptions} column={4}>
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
          {languageStr}
        </Descriptions.Item>
        <Descriptions.Item
          className={styles.descriptionItem}
          label="Tags"
          span={4}
        >
          <div>
            {series.tags.map((tag: string) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
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
      <EditSeriesModal
        series={props.series}
        visible={showingEditModal}
        editable
        toggleVisible={() => setShowingEditModal(!showingEditModal)}
        saveCallback={(series) => {
          if (series.remoteCoverUrl !== props.series?.remoteCoverUrl) {
            log.debug(`Updating cover for series ${props.series?.id}`);
            deleteThumbnail(series);
            downloadCover(series);
          }
          props.setSeries(series);
        }}
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
                props.removeSeries(
                  props.series,
                  values.deleteDownloads,
                  props.customDownloadsDir || defaultDownloadsDir
                );
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
            <Checkbox>Delete downloaded chapters</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={showingDownloadXModal}
        onCancel={() => setShowingDownloadXModal(false)}
        okText="Download"
        // okButtonProps={{ danger: true }}
        onOk={() => {
          downloadXForm
            .validateFields()
            .then((values) =>
              handleDownloadChapters(
                getNextChaptersToDownload(values.amount),
                false
              )
            )
            .catch((info) => {
              log.error(info);
            })
            .finally(() => setShowingDownloadXModal(false))
            .catch((info) => {
              log.error(info);
            });
        }}
      >
        <Form
          form={downloadXForm}
          name="download_x_form"
          initialValues={{ amount: 3 }}
        >
          <div className={styles.downloadXRow}>
            Download next{' '}
            <Form.Item
              className={styles.formItem}
              name="amount"
              valuePropName="value"
            >
              <InputNumber min={1} />
            </Form.Item>{' '}
            chapters
          </div>
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
        <div className={styles.backgroundImageContainer}>
          {props.seriesBannerUrl === null ? (
            <></>
          ) : (
            <img src={props.seriesBannerUrl} alt={props.series.title} />
          )}
        </div>
        <div className={styles.controlContainer}>
          <div className={styles.controlRow}>
            <Button
              className={styles.removeButton}
              onClick={() => setShowingRemoveModal(true)}
            >
              Remove Series
            </Button>
            {props.series.extensionId === FS_METADATA.id ? (
              <Button
                className={styles.editButton}
                onClick={() => setShowingEditModal(true)}
              >
                Edit Details
              </Button>
            ) : (
              ''
            )}
            <Button
              className={styles.trackerButton}
              onClick={() => setShowingTrackerModal(true)}
            >
              Trackers
            </Button>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() =>
                      handleDownloadChapters(getNextChaptersToDownload(1))
                    }
                  >
                    Next chapter
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      handleDownloadChapters(getNextChaptersToDownload(5))
                    }
                  >
                    Next 5 chapters
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      handleDownloadChapters(getNextChaptersToDownload(10))
                    }
                  >
                    Next 10 chapters
                  </Menu.Item>
                  <Menu.Item onClick={() => setShowingDownloadXModal(true)}>
                    Next X chapters
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      handleDownloadChapters(
                        getSortedFilteredChapterList().filter(
                          (chapter) => !chapter.read
                        )
                      )
                    }
                  >
                    Unread
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      handleDownloadChapters(getSortedFilteredChapterList())
                    }
                  >
                    All
                  </Menu.Item>
                </Menu>
              }
              placement="bottomLeft"
            >
              <Button className={styles.downloadButton}>Download</Button>
            </Dropdown>
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
        </div>
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
            {extensionMetadata !== undefined && 'name' in extensionMetadata ? (
              <Paragraph>{extensionMetadata.name}</Paragraph>
            ) : (
              ''
            )}
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
