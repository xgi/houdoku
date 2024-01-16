import React, { useEffect, useState } from 'react';
import { ipcRenderer, shell } from 'electron';
import log from 'electron-log';
import { Series } from '@tiyo/common';
import {
  Button,
  Group,
  Input,
  Loader,
  Stack,
  Text,
  Image,
  Grid,
  Select,
  NumberInput,
  ActionIcon,
  Skeleton,
  Tooltip,
} from '@mantine/core';
import { IconCopy, IconExternalLink, IconSearch } from '@tabler/icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import ipcChannels from '../../../constants/ipcChannels.json';
import {
  TrackEntry,
  TrackerSeries,
  TrackStatus,
  TrackScoreFormat,
  TrackerMetadata,
  TrackerListEntry,
} from '../../../models/types';
import { markChapters } from '../../../features/library/utils';
import { chapterListState, seriesState } from '../../../state/libraryStates';
import { chapterLanguagesState } from '../../../state/settingStates';

const SCORE_FORMAT_OPTIONS: {
  [key in TrackScoreFormat]: number[];
} = {
  [TrackScoreFormat.POINT_10]: [...Array(11).keys()],
  [TrackScoreFormat.POINT_100]: [...Array(101).keys()],
  [TrackScoreFormat.POINT_10_DECIMAL]: [...Array(101).keys()],
  [TrackScoreFormat.POINT_10_DECIMAL_ONE_DIGIT]: ((sequence) => {
    sequence.splice(1, 9);
    return [...sequence];
  })([...Array(101).keys()].map((num) => num / 10)),
  [TrackScoreFormat.POINT_5]: [...Array(6).keys()],
  [TrackScoreFormat.POINT_3]: [...Array(4).keys()],
};

type Props = {
  trackerMetadata: TrackerMetadata;
  series: Series;
  trackerKey: string;
  applySeriesTrackerKey: (key: string) => void;
};

const SeriesTrackerModalTab: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(props.series.title);

  const [username, setUsername] = useState<string | null>(null);
  const [trackerSeriesList, setTrackerSeriesList] = useState<TrackerSeries[] | null>(null);
  const [trackEntry, setTrackEntry] = useState<TrackEntry | null>(null);
  const [trackerListEntries, setTrackerListEntries] = useState<TrackerListEntry[]>([]);

  const [chapterList, setChapterList] = useRecoilState(chapterListState);
  const [series, setSeries] = useRecoilState(seriesState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);

  const loadTrackerData = async () => {
    setLoading(true);

    setUsername(
      await ipcRenderer
        .invoke(ipcChannels.TRACKER.GET_USERNAME, props.trackerMetadata.id)
        .catch((e) => log.error(e))
    );

    if (props.trackerKey) {
      const sourceTrackEntry = await ipcRenderer
        .invoke(ipcChannels.TRACKER.GET_LIBRARY_ENTRY, props.trackerMetadata.id, props.trackerKey)
        .catch((e) => log.error(e));

      setTrackEntry(
        sourceTrackEntry === null
          ? {
              seriesId: props.trackerKey,
              progress: 0,
              status: TrackStatus.Reading,
            }
          : sourceTrackEntry
      );
      setTrackerSeriesList([]);
    } else {
      const seriesList = await ipcRenderer
        .invoke(ipcChannels.TRACKER.SEARCH, props.trackerMetadata.id, searchText)
        .catch((e) => log.error(e));
      setTrackerSeriesList(seriesList.slice(0, 5));
      setTrackEntry(null);
    }

    const listEntries = await ipcRenderer
      .invoke(ipcChannels.TRACKER.GET_LIST_ENTRIES, props.trackerMetadata.id)
      .catch((e) => log.error(e));
    setTrackerListEntries(listEntries);

    setLoading(false);
  };

  const markChaptersAsRead = (trackerEntry: TrackEntry) => {
    const { progress } = trackerEntry;
    if (progress === undefined || series === undefined) {
      return;
    }
    const chaptersToMark = chapterList.filter((chapter) => {
      const chapterNumber = parseInt(chapter.chapterNumber, 10);
      if (Number.isNaN(chapterNumber)) {
        return false;
      }
      return chapterNumber <= progress;
    });

    markChapters(chaptersToMark, series, true, setChapterList, setSeries, chapterLanguages);
  };

  const renderTrackerSeriesList = () => {
    return (
      <>
        {trackerSeriesList && trackerSeriesList.length > 0 ? (
          <Stack spacing="xs">
            {trackerSeriesList.map((trackerSeries) => (
              <Grid key={trackerSeries.id} gutter="xs" align="center">
                <Grid.Col span={2}>
                  <Image
                    src={trackerSeries.coverUrl}
                    alt={trackerSeries.title}
                    style={{ width: '100%' }}
                  />
                </Grid.Col>
                <Grid.Col span={8}>
                  <Text weight={700} lineClamp={2}>
                    {trackerSeries.title}
                  </Text>
                  <Text lineClamp={2}>{trackerSeries.description}</Text>
                </Grid.Col>
                <Grid.Col span={2}>
                  <Button
                    variant="default"
                    onClick={() => props.applySeriesTrackerKey(trackerSeries.id)}
                  >
                    Link
                  </Button>
                </Grid.Col>
              </Grid>
            ))}
          </Stack>
        ) : (
          <Text>No series found.</Text>
        )}
      </>
    );
  };

  const renderTrackerSearch = () => {
    return (
      <>
        <Input
          autoFocus
          placeholder="Search for series..."
          defaultValue={searchText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') loadTrackerData();
          }}
          icon={<IconSearch size={16} />}
          my="xs"
        />

        {loading ? (
          <Stack spacing="xs" mt="xs">
            {[0, 1, 2, 3, 4].map(() => (
              <Skeleton height={85} />
            ))}
          </Stack>
        ) : (
          renderTrackerSeriesList()
        )}
      </>
    );
  };

  const renderTrackEntry = (trackerMetadata: TrackerMetadata) => {
    if (!trackEntry) return <Text>Failed to define tracker entry.</Text>;

    return (
      <>
        <Grid gutter="xs" mt="xs" align="center">
          <Grid.Col span={3}>
            <Text>Status</Text>
          </Grid.Col>
          <Grid.Col span={9}>
            {trackerMetadata.hasCustomLists ? (
              <Group noWrap spacing="xs">
                <Select
                  value={trackEntry.listId}
                  data={trackerListEntries.map((entry) => ({
                    value: entry.id,
                    label: entry.name,
                  }))}
                  onChange={(value: string) =>
                    setTrackEntry({
                      ...trackEntry,
                      listId: value,
                      listName: trackerListEntries.find((entry) => entry.id === value)?.name,
                      status: trackerListEntries.find((entry) => entry.id === value)?.status,
                    })
                  }
                />
              </Group>
            ) : (
              <Group noWrap spacing="xs">
                <Select
                  value={trackEntry?.status}
                  data={[
                    TrackStatus.Completed,
                    TrackStatus.Dropped,
                    TrackStatus.Paused,
                    TrackStatus.Planning,
                    TrackStatus.Reading,
                  ]}
                  onChange={(value: string) =>
                    setTrackEntry({
                      ...trackEntry,
                      status: value as TrackStatus,
                    })
                  }
                />
              </Group>
            )}
          </Grid.Col>

          <Grid.Col span={3}>
            <Text>Progress</Text>
          </Grid.Col>
          <Grid.Col span={9}>
            <Group noWrap spacing="xs">
              <NumberInput
                min={0}
                value={trackEntry.progress}
                onChange={(value) =>
                  setTrackEntry({
                    ...trackEntry,
                    progress: value,
                  })
                }
              />
              <Tooltip.Floating label="Copy progress to chapter list">
                <ActionIcon mx={4}>
                  <IconCopy size={18} onClick={() => markChaptersAsRead(trackEntry)} />
                </ActionIcon>
              </Tooltip.Floating>
            </Group>
          </Grid.Col>

          <Grid.Col span={3}>
            <Text>Score</Text>
          </Grid.Col>
          <Grid.Col span={9}>
            <Select
              value={trackEntry?.score !== undefined ? `${trackEntry.score}` : undefined}
              data={SCORE_FORMAT_OPTIONS[trackEntry.scoreFormat || TrackScoreFormat.POINT_10].map(
                (x) => x.toString()
              )}
              onChange={(value: string) =>
                setTrackEntry({
                  ...trackEntry,
                  score: parseFloat(value),
                })
              }
            />
          </Grid.Col>
        </Grid>
        <Group position="right" mt="md" mb={0} spacing="xs">
          <Button
            variant="default"
            onClick={() => {
              props.applySeriesTrackerKey('');
            }}
          >
            Unlink
          </Button>
          <Button
            variant="default"
            leftIcon={<IconExternalLink />}
            onClick={() =>
              shell.openExternal(
                trackEntry.url || `${trackerMetadata.url}/manga/${trackEntry.seriesId}`
              )
            }
          >
            View on {trackerMetadata.name}
          </Button>
        </Group>
      </>
    );
  };

  const renderTrackerContent = (trackerMetadata: TrackerMetadata) => {
    if (!username) {
      return (
        <Text mt="xs">
          In order to track this series, please link your {trackerMetadata.name} account through the{' '}
          <Text component="span" color="blue" weight={700}>
            Settings
          </Text>{' '}
          tab.
        </Text>
      );
    }

    return props.trackerKey ? renderTrackEntry(trackerMetadata) : renderTrackerSearch();
  };

  useEffect(() => {
    if (trackEntry !== null) {
      ipcRenderer
        .invoke(ipcChannels.TRACKER.UPDATE_LIBRARY_ENTRY, props.trackerMetadata.id, trackEntry)
        .catch((e) => log.error(e));
    }
  }, [props.trackerMetadata.id, trackEntry]);

  useEffect(() => {
    setSearchText(props.series.title);
    loadTrackerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.series, props.trackerKey]);

  return (
    <>
      {loading ? (
        <Group mt="sm" position="center">
          <Loader />
          <Text>Loading from {props.trackerMetadata.name}...</Text>
        </Group>
      ) : (
        renderTrackerContent(props.trackerMetadata)
      )}
    </>
  );
};

export default SeriesTrackerModalTab;
