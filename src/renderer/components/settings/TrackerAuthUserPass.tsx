import React, { useEffect, useState } from 'react';
const { ipcRenderer } = require('electron');
import { Accordion, Group, Code, Loader, Timeline } from '@mantine/core';
import ipcChannels from '@/common/constants/ipcChannels.json';
import storeKeys from '@/common/constants/storeKeys.json';
import persistantStore from '@/renderer/util/persistantStore';
import { TrackerMetadata } from '@/common/models/types';
import DefaultInput from '../general/DefaultInput';
import DefaultButton from '../general/DefaultButton';
import DefaultTimeline from '../general/DefaultTimeline';
import DefaultText from '../general/DefaultText';

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
  }, []);

  if (loading) {
    return (
      <Group justify="center">
        <Loader />
        <DefaultText>Reloading tracker details...</DefaultText>
      </Group>
    );
  }

  return (
    <>
      <Accordion.Control>
        <Group justify="space-between">
          <DefaultText>{props.trackerMetadata.name}</DefaultText>
          {username ? (
            <Group justify="flex-end">
              <DefaultText>
                Logged in as <Code>{username}</Code>
              </DefaultText>
              {username ? (
                <DefaultButton
                  ml="xs"
                  size="xs"
                  oc="red"
                  radius={0}
                  onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                    e.stopPropagation();
                    saveAccessToken('');
                  }}
                >
                  Unlink
                </DefaultButton>
              ) : undefined}
            </Group>
          ) : (
            <DefaultText>Not logged in.</DefaultText>
          )}
        </Group>
      </Accordion.Control>

      <Accordion.Panel>
        <DefaultTimeline active={-1} bulletSize={36} lineWidth={2} mt="sm">
          <Timeline.Item bullet={1}>
            <DefaultInput
              label="Username"
              style={{ maxWidth: 280 }}
              placeholder="Username"
              value={tempUsername}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempUsername(e.target.value)}
            />
            <DefaultInput
              label="Password"
              style={{ maxWidth: 280 }}
              type="password"
              placeholder="Password"
              value={tempPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempPassword(e.target.value)}
            />
          </Timeline.Item>
          <Timeline.Item bullet={2}>
            <DefaultButton onClick={() => submitUserPass()}>Submit</DefaultButton>
          </Timeline.Item>
        </DefaultTimeline>
      </Accordion.Panel>
    </>
  );
};

export default TrackerAuthUserPass;
