import React from 'react';
import { useRecoilState } from 'recoil';
import { Accordion, Alert, Checkbox } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons';
import { TrackerSetting } from '../../../common/models/types';
import { trackerAutoUpdateState } from '../../state/settingStates';
import {
  MUTrackerMetadata,
  AniListTrackerMetadata,
  MALTrackerMetadata,
} from '../../../common/temp_tracker_metadata';
import TrackerAuthOAuth from './TrackerAuthOAuth';
import TrackerAuthUserPass from './TrackerAuthUserPass';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const TrackerSettings: React.FC<Props> = () => {
  const [trackerAutoUpdate, setTrackerAutoUpdate] = useRecoilState(trackerAutoUpdateState);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateTrackerSetting = (trackerSetting: TrackerSetting, value: any) => {
    switch (trackerSetting) {
      case TrackerSetting.TrackerAutoUpdate:
        setTrackerAutoUpdate(value);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Alert
        icon={<IconInfoCircle size={16} />}
        title="Syncing progress with trackers"
        color="indigo"
      >
        Houdoku allows you to sync your account on list-tracking websites and automatically upload
        your progress as you read. After authenticating, click the &quot;Trackers&quot; button on a
        series page to link it with an entry on your list.
      </Alert>

      <Checkbox
        pt="sm"
        ml="xs"
        label="Update progress automatically"
        size="md"
        checked={trackerAutoUpdate}
        onChange={(e) => updateTrackerSetting(TrackerSetting.TrackerAutoUpdate, e.target.checked)}
      />

      <Accordion chevronPosition="left" mx="auto" pt="sm">
        {[AniListTrackerMetadata, MALTrackerMetadata].map((trackerMetadata) => (
          <Accordion.Item value={trackerMetadata.id} key={trackerMetadata.id}>
            <TrackerAuthOAuth trackerMetadata={trackerMetadata} />
          </Accordion.Item>
        ))}

        {[MUTrackerMetadata].map((trackerMetadata) => (
          <Accordion.Item value={trackerMetadata.id} key={trackerMetadata.id}>
            <TrackerAuthUserPass trackerMetadata={trackerMetadata} />
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  );
};

export default TrackerSettings;
