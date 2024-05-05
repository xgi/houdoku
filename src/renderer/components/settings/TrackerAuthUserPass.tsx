import React, { useEffect, useState } from 'react';
const { ipcRenderer } = require('electron');
import { Accordion, Text, Button, Group, Code, Input, Loader, Box, Timeline } from '@mantine/core';
import ipcChannels from '@/common/constants/ipcChannels.json';
import storeKeys from '@/common/constants/storeKeys.json';
import persistantStore from '@/renderer/util/persistantStore';
import { TrackerMetadata } from '@/common/models/types';

type Props = {
  trackerMetadata: TrackerMetadata;
};

const TrackerAuthUserPass: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [tempUsername, setTempUsername] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const loadTrackerDetails = async () => {
    setLoading(true);

    setUsername(
      await ipcRenderer
        .invoke(ipcChannels.TRACKER.GET_USERNAME, props.trackerMetadata.id)
        .catch((e) => console.error(e)),
    );

    setLoading(false);
  };

  const saveAccessToken = async (accessToken: string) => {
    setLoading(true);

    persistantStore.write(
      `${storeKeys.TRACKER_ACCESS_TOKEN_PREFIX}${props.trackerMetadata.id}`,
      accessToken,
    );
    await ipcRenderer
      .invoke(ipcChannels.TRACKER.SET_ACCESS_TOKEN, props.trackerMetadata.id, accessToken)
      .catch((e) => console.error(e));

    loadTrackerDetails();
  };

  const submitUserPass = async () => {
    setLoading(true);

    const credentials = JSON.stringify({
      username: tempUsername,
      password: tempPassword,
    });

    await ipcRenderer
      .invoke(ipcChannels.TRACKER.GET_TOKEN, props.trackerMetadata.id, credentials)
      .then((token: string | null) => saveAccessToken(token || ''))
      .catch((e) => console.error(e));
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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Accordion.Control>
          <Group position="apart">
            <Text>{props.trackerMetadata.name}</Text>
            {username ? (
              <Group position="right">
                <Text>
                  Logged in as <Code>{username}</Code>
                </Text>
              </Group>
            ) : (
              <Text>Not logged in.</Text>
            )}
          </Group>
        </Accordion.Control>
        {username ? (
          <Button
            ml="xs"
            compact
            color="red"
            radius={0}
            onClick={(e) => {
              e.stopPropagation();
              saveAccessToken('');
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
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
            />
            <Text>Password:</Text>
            <Input
              ml="sm"
              style={{ maxWidth: 280 }}
              type="password"
              placeholder="Password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
            />
          </Timeline.Item>
          <Timeline.Item bullet={2}>
            <Button ml="sm" onClick={() => submitUserPass()}>
              Submit
            </Button>
          </Timeline.Item>
        </Timeline>
      </Accordion.Panel>
    </>
  );
};

export default TrackerAuthUserPass;
