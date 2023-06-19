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
  Alert,
  Input,
  Loader,
  Box,
  Timeline,
  Checkbox,
} from '@mantine/core';
import { IconExternalLink, IconInfoCircle } from '@tabler/icons';
import ipcChannels from '../../constants/ipcChannels.json';
import storeKeys from '../../constants/storeKeys.json';
import persistantStore from '../../util/persistantStore';
import { AniListTrackerMetadata } from '../../services/trackers/anilist';
import { TrackerSetting } from '../../models/types';
import { MALTrackerMetadata } from '../../services/trackers/myanimelist';
import { trackerAutoUpdateState } from '../../state/settingStates';
import { MUTrackerMetadata } from '../../services/trackers/mangaupdate';

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
  const [passwords, setPasswords] = useState<{
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
      [MUTrackerMetadata.id]: await getUsername(MUTrackerMetadata.id),
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Accordion.Control>
                <Group position="apart">
                  <Text>{trackerMetadata.name}</Text>
                  {usernames[trackerMetadata.id] ? (
                    <Group position="right">
                      <Text>
                        Logged in as <Code>{usernames[trackerMetadata.id]}</Code>
                      </Text>
                    </Group>
                  ) : (
                    <Text>Not logged in.</Text>
                  )}
                </Group>
              </Accordion.Control>
              {usernames[trackerMetadata.id] ? (
                <Button
                  ml="xs"
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
              ) : undefined}
            </Box>

            <Accordion.Panel>
              <Timeline active={-1} bulletSize={36} lineWidth={2} mt="sm">
                <Timeline.Item bullet={1}>
                  <Button
                    ml="sm"
                    variant="default"
                    leftIcon={<IconExternalLink />}
                    onClick={() => shell.openExternal(authUrls[trackerMetadata.id])}
                  >
                    Authenticate on {trackerMetadata.name}
                  </Button>
                </Timeline.Item>
                <Timeline.Item bullet={2}>
                  <Input
                    ml="sm"
                    style={{ maxWidth: 280 }}
                    placeholder="Paste access code..."
                    value={accessCodes[trackerMetadata.id] || ''}
                    onChange={(e: any) =>
                      setAccessCodes({
                        ...accessCodes,
                        [trackerMetadata.id]: e.target.value,
                      })
                    }
                  />
                </Timeline.Item>
                <Timeline.Item bullet={3}>
                  <Button
                    ml="sm"
                    onClick={() =>
                      submitAccessCode(trackerMetadata.id, accessCodes[trackerMetadata.id])
                    }
                  >
                    Submit
                  </Button>
                </Timeline.Item>
              </Timeline>
            </Accordion.Panel>
          </Accordion.Item>
        ))}

        {[MUTrackerMetadata].map((trackerMetadata) => (
          <Accordion.Item value={trackerMetadata.id} key={trackerMetadata.id}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Accordion.Control>
                <Group position="apart">
                  <Text>{trackerMetadata.name}</Text>
                  {usernames[trackerMetadata.id] ? (
                    <Group position="right">
                      <Text>
                        Logged in as <Code>{usernames[trackerMetadata.id]}</Code>
                      </Text>
                    </Group>
                  ) : (
                    <Text>Not logged in.</Text>
                  )}
                </Group>
              </Accordion.Control>
              {usernames[trackerMetadata.id] ? (
                <Button
                  ml="xs"
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
              ) : undefined}
            </Box>

            <Accordion.Panel>
              <Timeline active={-1} bulletSize={36} lineWidth={2} mt="sm">
                <Timeline.Item bullet={1}>
                  <Text>Username:</Text>
                  <Input
                    ml="sm"
                    style={{ maxWidth: 280 }}
                    placeholder="Username"
                    value={usernames[trackerMetadata.id] || ''}
                    onChange={(e: any) =>
                      setUsernames({
                        ...usernames,
                        [trackerMetadata.id]: e.target.value,
                      })
                    }
                  />
                  <Text>Password:</Text>
                  <Input
                    ml="sm"
                    style={{ maxWidth: 280 }}
                    type="password"
                    placeholder="Password"
                    value={passwords[trackerMetadata.id] || ''}
                    onChange={(e: any) =>
                      setPasswords({
                        ...passwords,
                        [trackerMetadata.id]: e.target.value,
                      })
                    }
                  />
                </Timeline.Item>
                <Timeline.Item bullet={2}>
                  <Button
                    ml="sm"
                    onClick={() =>
                      submitAccessCode(
                        trackerMetadata.id,
                        JSON.stringify({
                          username: usernames[trackerMetadata.id],
                          password: passwords[trackerMetadata.id],
                        })
                      )
                    }
                  >
                    Submit
                  </Button>
                </Timeline.Item>
              </Timeline>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </>
  );
};

export default TrackerSettings;
