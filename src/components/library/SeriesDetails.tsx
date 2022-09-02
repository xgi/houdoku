import fs from 'fs';
import path from 'path';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Typography,
  Button,
  Descriptions,
  Affix,
  Modal,
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
import { Chapter, Series, Languages, ExtensionMetadata } from 'houdoku-extension-lib';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import ChapterTable from './ChapterTable';
import styles from './SeriesDetails.css';
import blankCover from '../../img/blank_cover.png';
import routes from '../../constants/routes.json';
import { getBannerImageUrl } from '../../services/mediasource';
import { reloadSeriesList } from '../../features/library/utils';
import ipcChannels from '../../constants/ipcChannels.json';
import SeriesTrackerModal from './SeriesTrackerModal';
import { FS_METADATA } from '../../services/extensions/filesystem';
import EditSeriesModal from './EditSeriesModal';
import { deleteThumbnail, getChapterDownloaded } from '../../util/filesystem';
import { downloadCover } from '../../util/download';
import library from '../../services/library';
import { downloaderClient, DownloadTask } from '../../services/downloader';
import constants from '../../constants/constants.json';
import {
  chapterFilterGroupState,
  chapterFilterTitleState,
  chapterListState,
  reloadingSeriesListState,
  seriesBannerUrlState,
  seriesListState,
  seriesState,
} from '../../state/libraryStates';
import { statusTextState } from '../../state/statusBarStates';
import {
  chapterLanguagesState,
  trackerAutoUpdateState,
  customDownloadsDirState,
} from '../../state/settingStates';
import RemoveSeriesModal from './RemoveSeriesModal';

const { Title } = Typography;
const { confirm } = Modal;

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

interface ParamTypes {
  id: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const SeriesDetails: React.FC<Props> = (props: Props) => {
  const { id } = useParams<ParamTypes>();
  const [extensionMetadata, setExtensionMetadata] = useState<ExtensionMetadata | undefined>();
  const [showingTrackerModal, setShowingTrackerModal] = useState(false);
  const [showingRemoveModal, setShowingRemoveModal] = useState(false);
  const [showingEditModal, setShowingEditModal] = useState(false);
  const [showingDownloadXModal, setShowingDownloadXModal] = useState(false);
  const [downloadXForm] = Form.useForm();
  const [series, setSeries] = useRecoilState(seriesState);
  const setSeriesList = useSetRecoilState(seriesListState);
  const [chapterList, setChapterList] = useRecoilState(chapterListState);
  const [seriesBannerUrl, setSeriesBannerUrl] = useRecoilState(seriesBannerUrlState);
  const chapterFilterTitle = useRecoilValue(chapterFilterTitleState);
  const chapterFilterGroup = useRecoilValue(chapterFilterGroupState);
  const [reloadingSeriesList, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const setStatusText = useSetRecoilState(statusTextState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);

  const loadContent = async () => {
    log.debug(`Series page is loading details from database for series ${id}`);

    const storedSeries: Series | null = library.fetchSeries(id);
    if (storedSeries === null) return;

    setSeries(storedSeries);
    setChapterList(library.fetchChapters(id));

    setExtensionMetadata(
      await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.GET, storedSeries.extensionId)
    );

    getBannerImageUrl(storedSeries)
      .then((url: string | null) => setSeriesBannerUrl(url))
      .catch((err: Error) => log.error(err));
  };

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (series === undefined) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  const getThumbnailPath = (seriesId?: string) => {
    const fileExtensions = constants.IMAGE_EXTENSIONS;
    for (let i = 0; i < fileExtensions.length; i += 1) {
      const thumbnailPath = path.join(thumbnailsDir, `${seriesId}.${fileExtensions[i]}`);
      if (fs.existsSync(thumbnailPath)) return thumbnailPath;
    }
    return blankCover;
  };

  const getSortedFilteredChapterList = () => {
    return chapterList
      .filter(
        (chapter: Chapter) =>
          (chapterLanguages.includes(chapter.languageKey) || chapterLanguages.length === 0) &&
          chapter.title.toLowerCase().includes(chapterFilterTitle) &&
          chapter.groupName.toLowerCase().includes(chapterFilterGroup)
      )
      .sort((a: Chapter, b: Chapter) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber));
  };

  const handleDownloadChapters = (chapters: Chapter[], largeAmountWarning = true) => {
    if (series === undefined) return;

    const queue: Chapter[] = [];
    chapters.forEach((chapter) => {
      if (
        series &&
        !getChapterDownloaded(series, chapter, customDownloadsDir || defaultDownloadsDir)
      ) {
        queue.push(chapter);
      }
    });

    const func = () => {
      downloaderClient.add(
        queue.map(
          (chapter: Chapter) =>
            ({
              chapter,
              series,
              downloadsDir: customDownloadsDir || defaultDownloadsDir,
            } as DownloadTask)
        )
      );
      downloaderClient.start();
    };

    if (queue.length >= 3 && largeAmountWarning) {
      confirm({
        title: `Download ${queue.length} chapters?`,
        icon: <ExclamationCircleOutlined />,
        content: 'You can view, pause, or cancel from the Downloads tab on the left.',
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
    sortedList.slice(startIndex === -1 ? 0 : startIndex + 1).every((chapter) => {
      if (series === undefined) return false;

      const chapterNumber = parseFloat(chapter.chapterNumber);
      const isDownloaded = getChapterDownloaded(
        series,
        chapter,
        customDownloadsDir || defaultDownloadsDir
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

  const renderSeriesDescriptions = () => {
    const language = Languages[series.originalLanguageKey];
    const languageStr = language !== undefined && 'name' in language ? language.name : '';

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
        <Descriptions.Item className={styles.descriptionItem} label="Tags" span={4}>
          <div>
            {series.tags.map((tag: string) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </Descriptions.Item>
      </Descriptions>
    );
  };

  if (series === undefined) return <></>;
  return (
    <>
      <SeriesTrackerModal
        loadSeriesContent={() => loadContent()}
        series={series}
        visible={showingTrackerModal}
        toggleVisible={() => setShowingTrackerModal(!showingTrackerModal)}
      />
      <EditSeriesModal
        series={series}
        visible={showingEditModal}
        editable
        toggleVisible={() => setShowingEditModal(!showingEditModal)}
        saveCallback={(newSeries) => {
          if (newSeries.remoteCoverUrl !== series?.remoteCoverUrl) {
            log.debug(`Updating cover for series ${series?.id}`);
            deleteThumbnail(newSeries);
            downloadCover(newSeries);
          }
          setSeries(newSeries);
        }}
      />
      <RemoveSeriesModal
        series={series}
        showing={showingRemoveModal}
        close={() => setShowingRemoveModal(false)}
      />
      <Modal
        visible={showingDownloadXModal}
        onCancel={() => setShowingDownloadXModal(false)}
        okText="Download"
        // okButtonProps={{ danger: true }}
        onOk={() => {
          downloadXForm
            .validateFields()
            .then((values) =>
              handleDownloadChapters(getNextChaptersToDownload(values.amount), false)
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
        <Form form={downloadXForm} name="download_x_form" initialValues={{ amount: 3 }}>
          <div className={styles.downloadXRow}>
            Download next{' '}
            <Form.Item className={styles.formItem} name="amount" valuePropName="value">
              <InputNumber min={1} />
            </Form.Item>{' '}
            chapters
          </div>
        </Form>
      </Modal>
      <Link to={routes.LIBRARY}>
        <Affix className={styles.backButtonAffix}>
          <Button onClick={() => setSeriesList(library.fetchSeriesList())}>
            ◀ Back to library
          </Button>
        </Affix>
      </Link>
      <div className={styles.backgroundContainer}>
        <div className={styles.backgroundImageContainer}>
          {seriesBannerUrl === null ? <></> : <img src={seriesBannerUrl} alt={series.title} />}
        </div>
        <div className={styles.controlContainer}>
          <div className={styles.controlRow}>
            <Button className={styles.removeButton} onClick={() => setShowingRemoveModal(true)}>
              Remove Series
            </Button>
            {series.extensionId === FS_METADATA.id ? (
              <Button className={styles.editButton} onClick={() => setShowingEditModal(true)}>
                Edit Details
              </Button>
            ) : (
              ''
            )}
            <Button className={styles.trackerButton} onClick={() => setShowingTrackerModal(true)}>
              Trackers
            </Button>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item onClick={() => handleDownloadChapters(getNextChaptersToDownload(1))}>
                    Next chapter
                  </Menu.Item>
                  <Menu.Item onClick={() => handleDownloadChapters(getNextChaptersToDownload(5))}>
                    Next 5 chapters
                  </Menu.Item>
                  <Menu.Item onClick={() => handleDownloadChapters(getNextChaptersToDownload(10))}>
                    Next 10 chapters
                  </Menu.Item>
                  <Menu.Item onClick={() => setShowingDownloadXModal(true)}>
                    Next X chapters
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      handleDownloadChapters(
                        getSortedFilteredChapterList().filter((chapter) => !chapter.read)
                      )
                    }
                  >
                    Unread
                  </Menu.Item>
                  <Menu.Item onClick={() => handleDownloadChapters(getSortedFilteredChapterList())}>
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
                if (series !== undefined && !reloadingSeriesList)
                  reloadSeriesList(
                    [series],
                    setSeriesList,
                    setReloadingSeriesList,
                    setStatusText,
                    chapterLanguages
                  )
                    .then(loadContent)
                    .catch((e) => log.error(e));
              }}
            >
              {reloadingSeriesList ? <SyncOutlined spin /> : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>
      <div className={styles.headerContainer}>
        <div>
          <img className={styles.coverImage} src={getThumbnailPath(series.id)} alt={series.title} />
        </div>
        <div className={styles.headerDetailsContainer}>
          <div className={styles.headerTitleRow}>
            <Title level={4}>{series.title}</Title>
            {extensionMetadata !== undefined && 'name' in extensionMetadata ? (
              <Paragraph>{extensionMetadata.name}</Paragraph>
            ) : (
              ''
            )}
          </div>
          <Paragraph ellipsis={{ rows: 5, expandable: true, symbol: 'more' }}>
            {series.description}
          </Paragraph>
        </div>
      </div>
      {renderSeriesDescriptions()}
      <ChapterTable series={series} />
    </>
  );
};

export default SeriesDetails;
