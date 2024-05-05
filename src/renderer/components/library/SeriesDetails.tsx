import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
const { ipcRenderer } = require('electron');
import { Series } from '@tiyo/common';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Center, Loader, Stack, Text } from '@mantine/core';
import ChapterTable from './ChapterTable';
import { getBannerImageUrl } from '@/renderer/services/mediasource';
import ipcChannels from '@/common/constants/ipcChannels.json';
import SeriesTrackerModal from './tracker/SeriesTrackerModal';
import EditSeriesModal from './EditSeriesModal';
import { deleteThumbnail } from '@/common/util/filesystem';
import { downloadCover } from '@/renderer/util/download';
import library from '@/renderer/services/library';
import {
  chapterFilterGroupState,
  chapterFilterTitleState,
  chapterListState,
  currentExtensionMetadataState,
  seriesBannerUrlState,
  seriesListState,
  seriesState,
} from '@/renderer/state/libraryStates';
import RemoveSeriesModal from './RemoveSeriesModal';
import DownloadModal from './DownloadModal';
import SeriesDetailsFloatingHeader from './series/SeriesDetailsFloatingHeader';
import SeriesDetailsBanner from './series/SeriesDetailsBanner';
import SeriesDetailsIntro from './series/SeriesDetailsIntro';
import SeriesDetailsInfoGrid from './series/SeriesDetailsInfoGrid';

type Props = unknown;

const SeriesDetails: React.FC<Props> = () => {
  const { id } = useParams<{ id: string }>();
  let series: Series = library.fetchSeries(id!)!;

  const location = useLocation();
  const setExtensionMetadata = useSetRecoilState(currentExtensionMetadataState);
  const [showingTrackerModal, setShowingTrackerModal] = useState(false);
  const [showingRemoveModal, setShowingRemoveModal] = useState(false);
  const [showingEditModal, setShowingEditModal] = useState(false);
  const [showingDownloadModal, setShowingDownloadModal] = useState(false);
  const setSeries = useSetRecoilState(seriesState);
  const seriesList = useRecoilValue(seriesListState);
  const setChapterList = useSetRecoilState(chapterListState);
  const setSeriesBannerUrl = useSetRecoilState(seriesBannerUrlState);
  const setChapterFilterTitle = useSetRecoilState(chapterFilterTitleState);
  const setChapterFilterGroup = useSetRecoilState(chapterFilterGroupState);
  const loadContent = async () => {
    console.info(`Series page is loading details from database for series ${id}`);

    series = library.fetchSeries(id!)!;
    setSeries(series);
    setChapterList(library.fetchChapters(id!));

    if (!series) {
      return;
    }

    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.GET, series.extensionId)
      .then((metadata) => setExtensionMetadata(metadata))
      .catch((err: Error) => console.error(err));

    getBannerImageUrl(series)
      .then((url: string | null) => setSeriesBannerUrl(url))
      .catch((err: Error) => console.error(err));
  };

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, seriesList]);

  useEffect(() => {
    setChapterFilterTitle('');
    setChapterFilterGroup('');
  }, [location, setChapterFilterGroup, setChapterFilterTitle]);

  return (
    <>
      {series ? (
        <>
          <SeriesTrackerModal
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
                console.debug(`Updating cover for series ${series?.id}`);
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

          <SeriesDetailsFloatingHeader series={series} />

          <SeriesDetailsBanner
            series={series}
            showDownloadModal={() => setShowingDownloadModal(true)}
            showEditModal={() => setShowingEditModal(true)}
            showTrackerModal={() => setShowingTrackerModal(true)}
            showRemoveModal={() => setShowingRemoveModal(true)}
          />

          <SeriesDetailsIntro series={series} />

          <SeriesDetailsInfoGrid series={series} />

          <ChapterTable series={series} />
        </>
      ) : (
        <Center h="100%" mx="auto">
          <Stack align="center">
            <Loader />
            <Text>Loading series details...</Text>
          </Stack>
        </Center>
      )}
    </>
  );
};

export default SeriesDetails;
