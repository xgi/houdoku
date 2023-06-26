/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useState } from 'react';
import { ipcRenderer, shell } from 'electron';
import log from 'electron-log';
import { Series } from 'houdoku-extension-lib';
import {
  Button,
  Group,
  Input,
  Loader,
  Modal,
  Stack,
  Tabs,
  Text,
  Image,
  Grid,
  Select,
  NumberInput,
  ActionIcon,
  Skeleton,
} from '@mantine/core';
import { IconCheck, IconExternalLink, IconSearch } from '@tabler/icons';
import ipcChannels from '../../constants/ipcChannels.json';
import { AniListTrackerMetadata } from '../../services/trackers/anilist';
import {
  TrackEntry,
  TrackerSeries,
  TrackStatus,
  TrackScoreFormat,
  TrackerMetadata,
  TrackerListEntry,
} from '../../models/types';
import { markChapters, updateSeriesTrackerKeys } from '../../features/library/utils';
import { MALTrackerMetadata } from '../../services/trackers/myanimelist';
import { MUTrackerMetadata } from '../../services/trackers/mangaupdate';
import { useRecoilState, useRecoilValue } from 'recoil';
import { chapterListState, seriesState } from '../../state/libraryStates';
import { chapterLanguagesState } from '../../state/settingStates';

const TRACKER_METADATAS = [AniListTrackerMetadata, MALTrackerMetadata, MUTrackerMetadata];

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
  series: Series;
  loadSeriesContent: () => void;
  visible: boolean;
  toggleVisible: () => void;
};

const SeriesTrackerModal: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(props.series.title);
  const [usernames, setUsernames] = useState<{
    [trackerId: string]: string | null;
  }>({});
  const [trackerSeriesLists, setTrackerSeriesLists] = useState<{
    [trackerId: string]: TrackerSeries[];
  }>({});
  const [trackEntries, setTrackEntries] = useState<{
    [trackerId: string]: TrackEntry;
  }>({});
  const [trackerListEntries, setTrackerListEntries] = useState<{
    [trackerId: string]: TrackerListEntry[];
  }>({});
  const [chapterList, setChapterList] = useRecoilState(chapterListState);
  const [series, setSeries] = useRecoilState(seriesState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);

  const loadTrackerData = async () => {
    setLoading(true);

    const _getUsername = (trackerId: string): Promise<string | null> =>
      ipcRenderer.invoke(ipcChannels.TRACKER.GET_USERNAME, trackerId).catch((e) => log.error(e));
    const _getTrackEntry = (trackerId: string, trackerKey: string) =>
      ipcRenderer
        .invoke(ipcChannels.TRACKER.GET_LIBRARY_ENTRY, trackerId, trackerKey)
        .catch((e) => log.error(e));
    const _getSeriesList = (trackerId: string): Promise<TrackerSeries[]> =>
      ipcRenderer
        .invoke(ipcChannels.TRACKER.SEARCH, trackerId, searchText)
        .catch((e) => log.error(e));
    const _getListEntries = (trackerId: string): Promise<TrackerListEntry[]> =>
      ipcRenderer
        .invoke(ipcChannels.TRACKER.GET_LIST_ENTRIES, trackerId)
        .catch((e) => log.error(e));

    const _usernames: { [trackerId: string]: string | null } = {};
    const _trackEntries: { [trackerId: string]: TrackEntry } = {};
    const _trackerSeriesLists: { [trackerId: string]: TrackerSeries[] } = {};
    const _trackerListEntries: { [trackerId: string]: TrackerListEntry[] } = {};

    await Promise.all(
      TRACKER_METADATAS.map(async (trackerMetadata) => {
        const username = await _getUsername(trackerMetadata.id);
        _usernames[trackerMetadata.id] = username;

        if (props.series.trackerKeys && props.series.trackerKeys[trackerMetadata.id]) {
          const trackerKey = props.series.trackerKeys[trackerMetadata.id];
          const sourceTrackEntry = await _getTrackEntry(trackerMetadata.id, trackerKey);

          _trackEntries[trackerMetadata.id] =
            sourceTrackEntry === null
              ? {
                  seriesId: trackerKey,
                  progress: 0,
                  status: TrackStatus.Reading,
                }
              : sourceTrackEntry;
        } else {
          const seriesList = await _getSeriesList(trackerMetadata.id);
          _trackerSeriesLists[trackerMetadata.id] = seriesList.slice(0, 5);
        }

        const listEntries = await _getListEntries(trackerMetadata.id);
        _trackerListEntries[trackerMetadata.id] = listEntries;
      })
    );

    setUsernames(_usernames);
    setTrackEntries(_trackEntries);
    setTrackerSeriesLists(_trackerSeriesLists);
    setTrackerListEntries(_trackerListEntries);
    setLoading(false);
  };

  const markChaptersAsRead = (trackerEntry: TrackEntry) => {
    let progress = trackerEntry.progress;
    if (progress === undefined || series === undefined) {
      return;
    }
    let chaptersToMark = chapterList.filter((chapter) => {
      let chapterNumber = parseInt(chapter.chapterNumber);
      if (isNaN(chapterNumber)) {
        return false;
      }
      return chapterNumber <= progress;
    });

    markChapters(
      chaptersToMark,
      series,
      true,
      setChapterList,
      setSeries,
      chapterLanguages
    );
  }

  const sendTrackEntry = (trackerId: string, trackEntry: TrackEntry) => {
    setTrackEntries({ ...trackEntries, [trackerId]: trackEntry });

    ipcRenderer
      .invoke(ipcChannels.TRACKER.UPDATE_LIBRARY_ENTRY, trackerId, trackEntry)
      .catch((e) => log.error(e));
  };

  const applySeriesTrackerKey = (trackerId: string, key: string) => {
    updateSeriesTrackerKeys(props.series, {
      ...props.series.trackerKeys,
      [trackerId]: key,
    });
    props.loadSeriesContent();
  };

  const renderTrackerSeriesList = (trackerId: string) => {
    return (
      <>
        {trackerSeriesLists[trackerId] && trackerSeriesLists[trackerId].length > 0 ? (
          <Stack spacing="xs">
            {trackerSeriesLists[trackerId].map((trackerSeries) => (
              <Grid gutter="xs" align="center">
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
                    onClick={() => applySeriesTrackerKey(trackerId, trackerSeries.id)}
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

  const renderTrackerSearch = (trackerId: string) => {
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
          renderTrackerSeriesList(trackerId)
        )}
      </>
    );
  };

  const renderTrackEntry = (trackerMetadata: TrackerMetadata) => {
    const trackEntry = trackEntries[trackerMetadata.id];
    if (trackEntry === undefined) return <Text>Failed to define tracker entry.</Text>;

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
                  data={trackerListEntries[trackerMetadata.id].map((entry) => ({
                    value: entry.id,
                    label: entry.name,
                  }))}
                  onChange={(value: string) =>
                    sendTrackEntry(trackerMetadata.id, {
                      ...trackEntry,
                      listId: value,
                      listName: trackerListEntries[trackerMetadata.id].find(
                        (entry) => entry.id === value
                      )!.name,
                      status: trackerListEntries[trackerMetadata.id].find(
                        (entry) => entry.id === value
                      )!.status,
                    })
                  }
                />
                <Text>{trackEntry.status}</Text>
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
                    sendTrackEntry(trackerMetadata.id, {
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
                  setTrackEntries({
                    ...trackEntries,
                    [trackerMetadata.id]: { ...trackEntry, progress: value },
                  })
                }
              />
              <ActionIcon
                variant="default"
                size="lg"
                onClick={() => sendTrackEntry(trackerMetadata.id, trackEntry)}
              >
                <IconCheck size={20} />
              </ActionIcon>
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
                sendTrackEntry(trackerMetadata.id, {
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
              applySeriesTrackerKey(trackerMetadata.id, '');
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
          <Button variant="default" onClick={()=> markChaptersAsRead(trackEntry)}>Copy progress</Button>
          <Button onClick={() => props.toggleVisible()}>Save</Button>
        </Group>
      </>
    );
  };

  const renderTrackerContent = (trackerMetadata: TrackerMetadata) => {
    if (!usernames[trackerMetadata.id]) {
      if (loading) {
        return (
          <Group mt="sm" position="center">
            <Loader />
            <Text>Loading from {trackerMetadata.name}...</Text>
          </Group>
        );
      }

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

    return props.series.trackerKeys && props.series.trackerKeys[trackerMetadata.id]
      ? renderTrackEntry(trackerMetadata)
      : renderTrackerSearch(trackerMetadata.id);
  };

  useEffect(() => {
    setSearchText(props.series.title);
    setUsernames({});
    setTrackEntries({});
    setTrackerSeriesLists({});

    if (props.visible) {
      loadTrackerData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.series, props.visible]);

  return (
    <Modal title="Trackers" opened={props.visible} onClose={props.toggleVisible}>
      <Tabs defaultValue={TRACKER_METADATAS[0].id}>
        <Tabs.List>
          {TRACKER_METADATAS.map((trackerMetadata) => (
            <Tabs.Tab value={trackerMetadata.id} key={trackerMetadata.id}>
              {trackerMetadata.name}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {TRACKER_METADATAS.map((trackerMetadata) => (
          <Tabs.Panel value={trackerMetadata.id} key={trackerMetadata.id}>
            {renderTrackerContent(trackerMetadata)}
          </Tabs.Panel>
        ))}
      </Tabs>
    </Modal>
  );
};

export default SeriesTrackerModal;
