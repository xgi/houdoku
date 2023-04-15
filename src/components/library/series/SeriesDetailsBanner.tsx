import React from 'react';
import { ipcRenderer } from 'electron';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { BackgroundImage, Box, Button, Group, Menu, Stack } from '@mantine/core';
import { IconMenu2, IconTrash } from '@tabler/icons';
import log from 'electron-log';
import { Series } from 'houdoku-extension-lib';
import ipcChannels from '../../../constants/ipcChannels.json';
import {
  categoryListState,
  reloadingSeriesListState,
  seriesBannerUrlState,
  seriesListState,
  seriesState,
  sortedFilteredChapterListState,
} from '../../../state/libraryStates';
import { downloadNextX, downloadAll } from '../../../features/library/chapterDownloadUtils';
import { removeSeries, reloadSeriesList } from '../../../features/library/utils';
import { FS_METADATA } from '../../../services/extensions/filesystem';
import {
  chapterLanguagesState,
  confirmRemoveSeriesState,
  customDownloadsDirState,
} from '../../../state/settingStates';
import { queueState } from '../../../state/downloaderStates';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

type Props = {
  series: Series;
  showDownloadModal: () => void;
  showEditModal: () => void;
  showTrackerModal: () => void;
};

const SeriesDetailsBanner: React.FC<Props> = (props: Props) => {
  const series = useRecoilValue(seriesState);
  const setSeriesList = useSetRecoilState(seriesListState);
  const seriesBannerUrl = useRecoilValue(seriesBannerUrlState);
  const sortedFilteredChapterList = useRecoilValue(sortedFilteredChapterListState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const downloadQueue = useRecoilValue(queueState);
  const [reloadingSeriesList, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const confirmRemoveSeries = useRecoilValue(confirmRemoveSeriesState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const categoryList = useRecoilValue(categoryListState);

  const handleDownloadNext1 = () => {
    downloadNextX(
      sortedFilteredChapterList,
      props.series,
      customDownloadsDir || defaultDownloadsDir,
      downloadQueue,
      1
    );
  };

  const handleDownloadUnread = () => {
    downloadAll(
      sortedFilteredChapterList,
      props.series,
      customDownloadsDir || defaultDownloadsDir,
      true
    );
  };

  const handleDownloadAll = () => {
    downloadAll(sortedFilteredChapterList, props.series, customDownloadsDir || defaultDownloadsDir);
  };

  const handleRefresh = () => {
    if (series !== undefined && !reloadingSeriesList)
      reloadSeriesList(
        [series],
        setSeriesList,
        setReloadingSeriesList,
        chapterLanguages,
        categoryList
      ).catch((e) => log.error(e));
  };

  return (
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
            {props.series.preview ? (
              ''
            ) : (
              <Group mx="sm" my={4} spacing="xs">
                <Menu position="bottom-end" shadow="md" width={200}>
                  <Menu.Target>
                    <Button size="sm" leftIcon={<IconMenu2 size={16} />} variant="default">
                      Options
                    </Button>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item onClick={handleDownloadNext1}>Download next</Menu.Item>
                    <Menu.Item onClick={() => props.showDownloadModal()}>Download next X</Menu.Item>
                    <Menu.Item onClick={handleDownloadUnread}>Download unread</Menu.Item>
                    <Menu.Item onClick={handleDownloadAll}>Download all</Menu.Item>

                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      icon={<IconTrash size={16} />}
                      onClick={() =>
                        confirmRemoveSeries
                          ? props.showDownloadModal()
                          : removeSeries(props.series, setSeriesList)
                      }
                    >
                      Remove series
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            )}
            <Group mx="sm" my={4} spacing="xs">
              {props.series.preview ? (
                ''
              ) : (
                <>
                  <Button size="sm" variant="default" onClick={() => props.showTrackerModal()}>
                    Trackers
                  </Button>
                  {props.series.extensionId === FS_METADATA.id ? (
                    <Button size="sm" variant="default" onClick={() => props.showEditModal()}>
                      Edit
                    </Button>
                  ) : (
                    ''
                  )}
                  <Button size="sm" loading={reloadingSeriesList} onClick={handleRefresh}>
                    {reloadingSeriesList ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </>
              )}
            </Group>
          </Stack>
        </BackgroundImage>
      </Box>
    </Box>
  );
};

export default SeriesDetailsBanner;
