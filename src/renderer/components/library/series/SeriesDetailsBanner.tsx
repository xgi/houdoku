import React from 'react';
const { ipcRenderer } = require('electron');
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { BackgroundImage, Box, Button, Group, Menu, Stack } from '@mantine/core';
import { IconMenu2, IconTrash } from '@tabler/icons';
import { Series } from '@tiyo/common';
import { useNavigate } from 'react-router-dom';
import ipcChannels from '@/common/constants/ipcChannels.json';
import {
  categoryListState,
  reloadingSeriesListState,
  seriesBannerUrlState,
  seriesListState,
  seriesState,
  sortedFilteredChapterListState,
} from '@/renderer/state/libraryStates';
import { downloadNextX, downloadAll } from '@/renderer/features/library/chapterDownloadUtils';
import { removeSeries, reloadSeriesList } from '@/renderer/features/library/utils';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import {
  chapterLanguagesState,
  confirmRemoveSeriesState,
  customDownloadsDirState,
} from '@/renderer/state/settingStates';
import { queueState } from '@/renderer/state/downloaderStates';
import routes from '@/common/constants/routes.json';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

type Props = {
  series: Series;
  showDownloadModal: () => void;
  showEditModal: () => void;
  showTrackerModal: () => void;
  showRemoveModal: () => void;
};

const SeriesDetailsBanner: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
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
      1,
    );
  };

  const removeFunc = () => {
    removeSeries(props.series, setSeriesList);
    navigate(`${routes.LIBRARY}`);
  };

  const handleDownloadUnread = () => {
    downloadAll(
      sortedFilteredChapterList,
      props.series,
      customDownloadsDir || defaultDownloadsDir,
      true,
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
        categoryList,
      ).catch((e) => console.error(e));
  };

  return (
    <Box
      ta={'center'}
      ml={'calc(-1 * var(--mantine-spacing-md))'}
      mr={'calc(-1 * var(--mantine-spacing-md))'}
      style={{ overflow: 'hidden' }}
    >
      <Box
        h={180}
        bg={
          `linear-gradient(135deg, var(--mantine-color-dark-8) 25%, transparent 25%) -50px 0,` +
          `linear-gradient(225deg, var(--mantine-color-dark-8) 25%, transparent 25%) -50px 0,` +
          `linear-gradient(315deg, var(--mantine-color-dark-8) 25%, transparent 25%),` +
          `linear-gradient(045deg, var(--mantine-color-dark-8) 25%, transparent 25%)`
        }
        bgsz={'100px 100px'}
      >
        <BackgroundImage
          src={seriesBannerUrl || ''}
          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
        >
          <Stack align="flex-end" justify="space-between" style={{ height: '100%' }}>
            {props.series.preview ? (
              ''
            ) : (
              <Group mx="sm" my={4} gap="xs">
                <Menu position="bottom-end" shadow="md" width={200}>
                  <Menu.Target>
                    <Button size="sm" leftSection={<IconMenu2 size={16} />} variant="default">
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
                      leftSection={<IconTrash size={16} />}
                      onClick={() => (confirmRemoveSeries ? props.showRemoveModal() : removeFunc())}
                    >
                      Remove series
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            )}
            <Group mx="sm" my={4} gap="xs">
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
