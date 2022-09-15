import React, { useEffect, useState } from 'react';
import { ipcRenderer, shell } from 'electron';
import log from 'electron-log';
import { useRecoilState } from 'recoil';
import {
  Accordion,
  Text,
  Button,
  Group,
  Code,
  Stepper,
  Alert,
  Grid,
  Switch,
  Input,
  Loader,
} from '@mantine/core';
import { IconExternalLink, IconInfoCircle } from '@tabler/icons';
import ipcChannels from '../../constants/ipcChannels.json';
import storeKeys from '../../constants/storeKeys.json';
import persistantStore from '../../util/persistantStore';
import { AniListTrackerMetadata } from '../../services/trackers/anilist';
import { TrackerSetting } from '../../models/types';
import { MALTrackerMetadata } from '../../services/trackers/myanimelist';
import { trackerAutoUpdateState } from '../../state/settingStates';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const TrackerSettings: React.FC<Props> = (props: Props) => {
  const [trackerAutoUpdate, setTrackerAutoUpdate] = useRecoilState(trackerAutoUpdateState);
  const [loading, setLoading] = useState(true);
  const [accessCodes, setAccessCodes] = useState<{
    [trackerId: string]: string;
  }>({});
  const [authUrls, setAuthUrls] = useState<{ [trackerId: string]: string }>({});
  const [usernames, setUsernames] = useState<{
    [trackerId: string]: string | null;
  }>({});

  const updateTrackerSetting = (trackerSetting: TrackerSetting, value: any) => {
    switch (trackerSetting) {
      case TrackerSetting.TrackerAutoUpdate:
        setTrackerAutoUpdate(value);
        break;
      default:
        break;
    }
  };

  const getUsername = (trackerId: string): Promise<string | null> => {
    return ipcRenderer
      .invoke(ipcChannels.TRACKER.GET_USERNAME, trackerId)
      .catch((e) => log.error(e));
  };

  const loadTrackerDetails = async () => {
    setLoading(true);

    setAuthUrls(
      await ipcRenderer.invoke(ipcChannels.TRACKER.GET_AUTH_URLS).catch((e) => log.error(e))
    );

    setUsernames({
      [AniListTrackerMetadata.id]: await getUsername(AniListTrackerMetadata.id),
      [MALTrackerMetadata.id]: await getUsername(MALTrackerMetadata.id),
    });

    setLoading(false);
  };

  const saveAccessToken = async (trackerId: string, accessToken: string) => {
    setLoading(true);

    persistantStore.write(`${storeKeys.TRACKER_ACCESS_TOKEN_PREFIX}${trackerId}`, accessToken);
    await ipcRenderer
      .invoke(ipcChannels.TRACKER.SET_ACCESS_TOKEN, trackerId, accessToken)
      .catch((e) => log.error(e));

    loadTrackerDetails();
  };

  const submitAccessCode = async (trackerId: string, accessCode: string) => {
    setLoading(true);

    await ipcRenderer
      .invoke(ipcChannels.TRACKER.GET_TOKEN, trackerId, accessCode)
      .then((token: string | null) => saveAccessToken(trackerId, token || ''))
      .catch((e) => log.error(e));
  };

  useEffect(() => {
    loadTrackerDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Group position="center">
        <Loader />
        <Text>Reloading tracker details...</Text>
      </Group>
    );
  }

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

      <Grid pt="sm">
        <Grid.Col span={5}>Update progress automatically</Grid.Col>
        <Grid.Col span={7}>
          <Switch
            size="md"
            checked={trackerAutoUpdate}
            onChange={(e) =>
              updateTrackerSetting(TrackerSetting.TrackerAutoUpdate, e.target.checked)
            }
          />
        </Grid.Col>
      </Grid>

      <Accordion chevronPosition="left" mx="auto" pt="sm">
        {[AniListTrackerMetadata, MALTrackerMetadata].map((trackerMetadata) => (
          <Accordion.Item value={trackerMetadata.id}>
            <Accordion.Control>
              <Group position="apart">
                <Text>{trackerMetadata.name}</Text>
                {usernames[trackerMetadata.id] ? (
                  <Group position="right">
                    <Text>
                      Logged in as <Code>{usernames[trackerMetadata.id]}</Code>
                    </Text>
                    <Button
                      compact
                      color="red"
                      radius={0}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        saveAccessToken(trackerMetadata.id, '');
                      }}
                    >
                      Unlink
                    </Button>
                  </Group>
                ) : (
                  <Text>Not logged in.</Text>
                )}
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stepper active={-1} orientation="vertical">
                <Stepper.Step
                  label={
                    <Button
                      variant="default"
                      leftIcon={<IconExternalLink />}
                      onClick={() => shell.openExternal(authUrls[trackerMetadata.id])}
                    >
                      Authenticate on {trackerMetadata.name}
                    </Button>
                  }
                />
                <Stepper.Step
                  label={
                    <Input
                      placeholder="Paste access code..."
                      value={accessCodes[trackerMetadata.id]}
                      onChange={(e: any) =>
                        setAccessCodes({
                          ...accessCodes,
                          [trackerMetadata.id]: e.target.value,
                        })
                      }
                    />
                  }
                />
                <Stepper.Step
                  label={
                    <Button
                      onClick={() =>
                        submitAccessCode(trackerMetadata.id, accessCodes[trackerMetadata.id])
                      }
                    >
                      Submit
                    </Button>
                  }
                />
              </Stepper>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  );
};

export default TrackerSettings;
