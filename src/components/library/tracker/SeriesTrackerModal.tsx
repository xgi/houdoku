import React, { useEffect, useState } from 'react';
import { Series } from 'houdoku-extension-lib';
import { Modal, Tabs } from '@mantine/core';
import { AniListTrackerMetadata } from '../../../services/trackers/anilist';
import { MALTrackerMetadata } from '../../../services/trackers/myanimelist';
import { MUTrackerMetadata } from '../../../services/trackers/mangaupdate';
import SeriesTrackerModalTab from './SeriesTrackerModalTab';
import { updateSeriesTrackerKeys } from '../../../features/library/utils';

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
      </Tabs>
    </Modal>
  );
};

export default SeriesTrackerModal;
