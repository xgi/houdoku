import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Series } from '@tiyo/common';
import {
  reloadingSeriesListState,
  seriesListState,
  seriesState,
} from '@/renderer/state/libraryStates';
import { reloadSeriesList } from '@/renderer/features/library/utils';
import { chapterLanguagesState } from '@/renderer/state/settingStates';
import { Button } from '@/ui/components/Button';
import { SeriesDetailsBannerBackground } from './SeriesDetailsBannerBackground';
import { Loader2 } from 'lucide-react';
import { FS_METADATA } from '@/common/temp_fs_metadata';

type SeriesDetailsBannerProps = {
  series: Series;
  showDownloadModal: () => void;
  showEditModal: () => void;
  showTrackerModal: () => void;
  showRemoveModal: () => void;
};

const SeriesDetailsBanner: React.FC<SeriesDetailsBannerProps> = (
  props: SeriesDetailsBannerProps,
) => {
  const series = useRecoilValue(seriesState);
  const setSeriesList = useSetRecoilState(seriesListState);
  const [reloadingSeriesList, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);

  const handleRefresh = () => {
    if (series !== undefined && !reloadingSeriesList)
      reloadSeriesList([series], setSeriesList, setReloadingSeriesList, chapterLanguages).catch(
        (e) => console.error(e),
      );
  };

  return (
    <div className="-mx-2 h-[180px]" style={{ overflow: 'hidden' }}>
      <SeriesDetailsBannerBackground>
        <div className="flex justify-end h-full">
          <div className="flex flex-col justify-end">
            <div className="flex m-2 space-x-2">
              {props.series.extensionId === FS_METADATA.id && (
                <Button
                  className="!bg-neutral-50 !text-neutral-950 hover:!bg-neutral-200"
                  onClick={() => props.showEditModal()}
                >
                  Edit
                </Button>
              )}
              <Button
                className="!bg-neutral-50 !text-neutral-950 hover:!bg-neutral-200"
                onClick={() => props.showTrackerModal()}
              >
                Trackers
              </Button>
              <Button
                disabled={reloadingSeriesList}
                className="!bg-neutral-50 !text-neutral-950 hover:!bg-neutral-200 disabled:!bg-neutral-500 disabled:!opacity-100"
                onClick={() => handleRefresh()}
              >
                {reloadingSeriesList && <Loader2 className="animate-spin" />}
                {reloadingSeriesList ? 'Refreshing...' : 'Refresh'}{' '}
              </Button>
            </div>
          </div>
        </div>
      </SeriesDetailsBannerBackground>

      {/* <Stack align="flex-end" justify="space-between" style={{ height: '100%' }}>
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
          </Stack> */}
    </div>
  );
};

export default SeriesDetailsBanner;
