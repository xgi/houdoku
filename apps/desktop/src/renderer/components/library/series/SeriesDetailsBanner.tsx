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
import { Button } from '@houdoku/ui/components/Button';
import { SeriesDetailsBannerBackground } from './SeriesDetailsBannerBackground';
import { Loader2, MenuIcon } from 'lucide-react';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@houdoku/ui/components/DropdownMenu';

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
          <div className="flex flex-col justify-between">
            <div className="flex justify-end m-2">
              {!props.series.preview && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="!bg-neutral-50 !text-neutral-950 hover:!bg-neutral-200"
                      size="sm"
                    >
                      <MenuIcon className="w-4 h-4" />
                      Options
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={() => props.showDownloadModal()}>
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => props.showRemoveModal()}>
                        Remove series
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
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
    </div>
  );
};

export default SeriesDetailsBanner;
