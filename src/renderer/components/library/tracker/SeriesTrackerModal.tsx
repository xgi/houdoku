import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { Tabs } from '@mantine/core';
import {
  MUTrackerMetadata,
  AniListTrackerMetadata,
  MALTrackerMetadata,
} from '@/common/temp_tracker_metadata';
import SeriesTrackerModalTab from './SeriesTrackerModalTab';
import { updateSeriesTrackerKeys } from '@/renderer/features/library/utils';
import DefaultModal from '../../general/DefaultModal';
import DefaultTabs from '../../general/DefaultTabs';

const TRACKER_METADATAS = [AniListTrackerMetadata, MALTrackerMetadata, MUTrackerMetadata];

type Props = {
  series: Series;
  visible: boolean;
  toggleVisible: () => void;
};

const SeriesTrackerModal: React.FC<Props> = (props: Props) => {
  const [seriesTrackerKeys, setSeriesTrackerKeys] = useState<{
    [trackerId: string]: string;
  }>();

  const applySeriesTrackerKey = (trackerId: string, key: string) => {
    const newSeries = updateSeriesTrackerKeys(props.series, {
      ...props.series.trackerKeys,
      [trackerId]: key,
    });
    setSeriesTrackerKeys(newSeries.trackerKeys);
  };

  useEffect(() => {
    if (props.series) {
      setSeriesTrackerKeys(props.series.trackerKeys);
    }
  }, [props.series]);

  return (
    <DefaultModal title="Trackers" opened={props.visible} onClose={props.toggleVisible}>
      <DefaultTabs defaultValue={TRACKER_METADATAS[0].id}>
        <Tabs.List>
          {TRACKER_METADATAS.map((trackerMetadata) => (
            <Tabs.Tab value={trackerMetadata.id} key={trackerMetadata.id}>
              {trackerMetadata.name}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {TRACKER_METADATAS.map((trackerMetadata) => (
          <Tabs.Panel value={trackerMetadata.id} key={trackerMetadata.id}>
            <SeriesTrackerModalTab
              series={props.series}
              trackerKey={
                seriesTrackerKeys && seriesTrackerKeys[trackerMetadata.id]
                  ? seriesTrackerKeys[trackerMetadata.id]
                  : ''
              }
              applySeriesTrackerKey={(key: string) =>
                applySeriesTrackerKey(trackerMetadata.id, key)
              }
              // loadSeriesContent={props.loadSeriesContent}
              // toggleVisible={props.toggleVisible}
              trackerMetadata={trackerMetadata}
            />
          </Tabs.Panel>
        ))}
      </DefaultTabs>
    </DefaultModal>
  );
};

export default SeriesTrackerModal;
