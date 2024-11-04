import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { BackgroundImage, Box, Group, Menu, Stack } from '@mantine/core';
import { IconDownload, IconMenu2, IconTrash } from '@tabler/icons';
import { Series } from '@tiyo/common';
import {
  categoryListState,
  reloadingSeriesListState,
  seriesBannerUrlState,
  seriesListState,
  seriesState,
} from '@/renderer/state/libraryStates';
import { reloadSeriesList } from '@/renderer/features/library/utils';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import { chapterLanguagesState, themeState } from '@/renderer/state/settingStates';
import DefaultButton from '../../general/DefaultButton';
import DefaultMenu from '../../general/DefaultMenu';
import { themeProps } from '@/renderer/util/themes';

type Props = {
  series: Series;
  showDownloadModal: () => void;
  showEditModal: () => void;
  showTrackerModal: () => void;
  showRemoveModal: () => void;
};

const SeriesDetailsBanner: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);
  const series = useRecoilValue(seriesState);
  const setSeriesList = useSetRecoilState(seriesListState);
  const seriesBannerUrl = useRecoilValue(seriesBannerUrlState);
  const [reloadingSeriesList, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const categoryList = useRecoilValue(categoryListState);

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
                <DefaultMenu position="bottom-end" shadow="md" width={200}>
                  <Menu.Target>
                    <DefaultButton size="xs" leftSection={<IconMenu2 size={16} />}>
                      Options
                    </DefaultButton>
                  </Menu.Target>

                  <Menu.Dropdown {...themeProps(theme)}>
                    <Menu.Item
                      leftSection={<IconDownload size={16} />}
                      onClick={() => props.showDownloadModal()}
                    >
                      Download
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={16} />}
                      onClick={() => props.showRemoveModal()}
                    >
                      Remove series
                    </Menu.Item>
                  </Menu.Dropdown>
                </DefaultMenu>
              </Group>
            )}
            <Group mx="sm" my={4} gap="xs">
              {props.series.preview ? (
                ''
              ) : (
                <>
                  <DefaultButton size="xs" onClick={() => props.showTrackerModal()}>
                    Trackers
                  </DefaultButton>
                  {props.series.extensionId === FS_METADATA.id ? (
                    <DefaultButton size="xs" onClick={() => props.showEditModal()}>
                      Edit
                    </DefaultButton>
                  ) : (
                    ''
                  )}
                  <DefaultButton
                    oc="blue"
                    size="xs"
                    loading={reloadingSeriesList}
                    onClick={handleRefresh}
                  >
                    {reloadingSeriesList ? 'Refreshing...' : 'Refresh'}
                  </DefaultButton>
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
