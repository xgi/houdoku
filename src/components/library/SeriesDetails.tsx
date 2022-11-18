import fs from 'fs';
import path from 'path';
import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { Series, Languages, ExtensionMetadata } from 'houdoku-extension-lib';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  Affix,
  BackgroundImage,
  Badge,
  Box,
  Button,
  Grid,
  Group,
  Image,
  Menu,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowLeft, IconHeart, IconMenu2, IconTrash } from '@tabler/icons';
import ChapterTable from './ChapterTable';
import blankCover from '../../img/blank_cover.png';
import { getBannerImageUrl } from '../../services/mediasource';
import ipcChannels from '../../constants/ipcChannels.json';
import SeriesTrackerModal from './SeriesTrackerModal';
import EditSeriesModal from './EditSeriesModal';
import { deleteThumbnail } from '../../util/filesystem';
import { downloadCover } from '../../util/download';
import library from '../../services/library';
import constants from '../../constants/constants.json';
import {
  categoryListState,
  chapterFilterGroupState,
  chapterFilterTitleState,
  chapterListState,
  reloadingSeriesListState,
  seriesBannerUrlState,
  seriesListState,
  seriesState,
  sortedFilteredChapterListState,
} from '../../state/libraryStates';
import {
  chapterLanguagesState,
  confirmRemoveSeriesState,
  customDownloadsDirState,
} from '../../state/settingStates';
import RemoveSeriesModal from './RemoveSeriesModal';
import { reloadSeriesList, removeSeries } from '../../features/library/utils';
import routes from '../../constants/routes.json';
import { FS_METADATA } from '../../services/extensions/filesystem';
import DownloadModal from './DownloadModal';
import { downloadAll, downloadNextX } from '../../features/library/chapterDownloadUtils';
import { queueState } from '../../state/downloaderStates';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const SeriesDetails: React.FC<Props> = (props: Props) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [extensionMetadata, setExtensionMetadata] = useState<ExtensionMetadata | undefined>();
  const [showingTrackerModal, setShowingTrackerModal] = useState(false);
  const [showingRemoveModal, setShowingRemoveModal] = useState(false);
  const [showingEditModal, setShowingEditModal] = useState(false);
  const [showingDownloadModal, setShowingDownloadModal] = useState(false);
  const [series, setSeries] = useRecoilState(seriesState);
  const [seriesList, setSeriesList] = useRecoilState(seriesListState);
  const setChapterList = useSetRecoilState(chapterListState);
  const sortedFilteredChapterList = useRecoilValue(sortedFilteredChapterListState);
  const [seriesBannerUrl, setSeriesBannerUrl] = useRecoilState(seriesBannerUrlState);
  const setChapterFilterTitle = useSetRecoilState(chapterFilterTitleState);
  const setChapterFilterGroup = useSetRecoilState(chapterFilterGroupState);
  const [reloadingSeriesList, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const categoryList = useRecoilValue(categoryListState);
  const downloadQueue = useRecoilValue(queueState);
  const confirmRemoveSeries = useRecoilValue(confirmRemoveSeriesState);

  const loadContent = async () => {
    log.info(`Series page is loading details from database for series ${id}`);

    const storedSeries: Series | null = library.fetchSeries(id!);
    if (storedSeries === null) return;

    setSeries(storedSeries);
    setChapterList(library.fetchChapters(id!));

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
  }, [id, seriesList]);

  useEffect(() => {
    setChapterFilterTitle('');
    setChapterFilterGroup('');
  }, [location, setChapterFilterGroup, setChapterFilterTitle]);

  if (series === undefined) return <></>;

  const getThumbnailPath = (seriesId?: string) => {
    const fileExtensions = constants.IMAGE_EXTENSIONS;
    for (let i = 0; i < fileExtensions.length; i += 1) {
      const thumbnailPath = path.join(thumbnailsDir, `${seriesId}.${fileExtensions[i]}`);
      if (fs.existsSync(thumbnailPath)) return thumbnailPath;
    }
    return series.remoteCoverUrl || blankCover;
  };

  const renderDetailsGrid = () => {
    const language = Languages[series.originalLanguageKey];
    const languageStr = language !== undefined && 'name' in language ? language.name : '';

    const getCol = (heading: string, content: string) => (
      <Grid.Col span={3}>
        <Text ml={4} color="dimmed" size="sm">
          <b>{heading}</b>
        </Text>
        <Box
          sx={(theme) => ({
            backgroundColor: theme.colors.dark[6],
            padding: '6px 12px',
          })}
        >
          <Text size="sm" lineClamp={1} title={content}>
            {content}
          </Text>
        </Box>
      </Grid.Col>
    );

    return (
      <Grid my="xs" gutter="xs">
        {getCol('Author', series.authors.join('; ') || 'Unknown')}
        {getCol('Artist', series.artists.join('; ') || 'Unknown')}
        {getCol('Status', series.status || 'Unknown')}
        {getCol('Language', languageStr)}
        <Grid.Col span={12}>
          <Group spacing="xs">
            {series.tags.map((tag: string) => (
              <Badge key={tag} color="indigo">
                {tag}
              </Badge>
            ))}
          </Group>
        </Grid.Col>
      </Grid>
    );
  };

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
        close={() => setShowingEditModal(false)}
        saveCallback={(newSeries) => {
          if (newSeries.remoteCoverUrl !== series?.remoteCoverUrl) {
            log.debug(`Updating cover for series ${series?.id}`);
            deleteThumbnail(newSeries);
            downloadCover(newSeries);
          }
          setSeries(newSeries);
        }}
      />
      <DownloadModal
        series={series}
        visible={showingDownloadModal}
        close={() => setShowingDownloadModal(false)}
      />
      <RemoveSeriesModal
        series={series}
        showing={showingRemoveModal}
        close={() => setShowingRemoveModal(false)}
      />

      <Affix position={{ top: 29, left: 205 }} zIndex={0}>
        {series.preview ? (
          <Link to={routes.SEARCH}>
            <Button size="sm" leftIcon={<IconArrowLeft size={16} />} variant="default">
              Back to search
            </Button>
          </Link>
        ) : (
          <Link to={routes.LIBRARY}>
            <Button
              size="sm"
              leftIcon={<IconArrowLeft size={16} />}
              variant="default"
              onClick={() => setSeriesList(library.fetchSeriesList())}
            >
              Back to library
            </Button>
          </Link>
        )}
      </Affix>

      {series.preview ? (
        <Affix position={{ top: 29, right: 20 }} zIndex={0}>
          <Button
            size="sm"
            color="teal"
            leftIcon={<IconHeart size={16} />}
            variant="filled"
            onClick={() => {
              downloadCover(series);
              library.upsertSeries({ ...series, preview: false });
              setSeriesList(library.fetchSeriesList());
            }}
          >
            Add to library
          </Button>
        </Affix>
      ) : (
        ''
      )}

      <Box
        sx={(theme) => ({
          textAlign: 'center',
          marginLeft: -theme.spacing.md,
          marginRight: -theme.spacing.md,
          marginTop: -theme.spacing.md,
          overflow: 'hidden',
        })}
      >
        <Box
          sx={(theme) => ({
            height: 180,
            background:
              `linear-gradient(135deg, ${theme.colors.dark[8]} 25%, transparent 25%) -50px 0,` +
              `linear-gradient(225deg, ${theme.colors.dark[8]} 25%, transparent 25%) -50px 0,` +
              `linear-gradient(315deg, ${theme.colors.dark[8]} 25%, transparent 25%),` +
              `linear-gradient(45deg, ${theme.colors.dark[8]} 25%, transparent 25%)`,
            backgroundSize: '100px 100px',
            backgroundColor: theme.colors.dark[6],
          })}
        >
          <BackgroundImage
            src={seriesBannerUrl || ''}
            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
          >
            <Stack align="flex-end" justify="space-between" style={{ height: '100%' }}>
              {series.preview ? (
                ''
              ) : (
                <Group mx="sm" my={4} spacing="xs">
                  <Menu position="bottom-end" shadow="md" width={200}>
                    <Menu.Target>
                      <Button size="sm" leftIcon={<IconMenu2 size={16} />} variant="default">
                        More
                      </Button>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        onClick={() =>
                          downloadNextX(
                            sortedFilteredChapterList,
                            series,
                            customDownloadsDir || defaultDownloadsDir,
                            downloadQueue,
                            1
                          )
                        }
                      >
                        Download next
                      </Menu.Item>
                      <Menu.Item onClick={() => setShowingDownloadModal(true)}>
                        Download next X
                      </Menu.Item>
                      <Menu.Item
                        onClick={() =>
                          downloadAll(
                            sortedFilteredChapterList,
                            series,
                            customDownloadsDir || defaultDownloadsDir,
                            true
                          )
                        }
                      >
                        Download unread
                      </Menu.Item>
                      <Menu.Item
                        onClick={() =>
                          downloadAll(
                            sortedFilteredChapterList,
                            series,
                            customDownloadsDir || defaultDownloadsDir
                          )
                        }
                      >
                        Download all
                      </Menu.Item>

                      <Menu.Divider />
                      <Menu.Item
                        color="red"
                        icon={<IconTrash size={16} />}
                        onClick={() =>
                          confirmRemoveSeries
                            ? setShowingRemoveModal(true)
                            : removeSeries(
                                series,
                                setSeriesList,
                                false,
                                customDownloadsDir || defaultDownloadsDir
                              )
                        }
                      >
                        Remove series
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              )}
              <Group mx="sm" my={4} spacing="xs">
                {series.preview ? (
                  ''
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setShowingTrackerModal(true)}
                    >
                      Trackers
                    </Button>
                    {series.extensionId === FS_METADATA.id ? (
                      <Button size="sm" variant="default" onClick={() => setShowingEditModal(true)}>
                        Edit
                      </Button>
                    ) : (
                      ''
                    )}
                    <Button
                      size="sm"
                      loading={reloadingSeriesList}
                      onClick={() => {
                        if (series !== undefined && !reloadingSeriesList)
                          reloadSeriesList(
                            [series],
                            setSeriesList,
                            setReloadingSeriesList,
                            chapterLanguages,
                            categoryList
                          )
                            .then(loadContent)
                            .catch((e) => log.error(e));
                      }}
                    >
                      {reloadingSeriesList ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  </>
                )}
              </Group>
            </Stack>
          </BackgroundImage>
        </Box>
      </Box>

      <Grid columns={24} gutter="xs">
        <Grid.Col span={5}>
          <Image src={getThumbnailPath(series.id)} alt={series.title} width="100%" mt="-50%" />
        </Grid.Col>
        <Grid.Col span={19}>
          <Group position="apart" mt="xs" mb="xs" align="center" noWrap>
            <Title order={4} lineClamp={1}>
              {series.title}
            </Title>
            <Text>{extensionMetadata?.name}</Text>
          </Group>
          <ScrollArea style={{ height: 100 }}>{series.description}</ScrollArea>
        </Grid.Col>
      </Grid>

      {renderDetailsGrid()}

      <ChapterTable series={series} />
    </>
  );
};

export default SeriesDetails;
