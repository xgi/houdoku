import React, { useEffect, useState } from 'react';
const { ipcRenderer, shell } = require('electron');
import { Accordion, Group, Code, Loader, Timeline } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons';
import ipcChannels from '@/common/constants/ipcChannels.json';
import storeKeys from '@/common/constants/storeKeys.json';
import persistantStore from '@/renderer/util/persistantStore';
import { TrackerMetadata } from '@/common/models/types';
import DefaultButton from '../general/DefaultButton';
import DefaultInput from '../general/DefaultInput';
import DefaultTimeline from '../general/DefaultTimeline';
import DefaultText from '../general/DefaultText';

type Props = {
  trackerMetadata: TrackerMetadata;
};

const TrackerAuthOAuth: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [authUrls, setAuthUrls] = useState<{ [trackerId: string]: string }>({});
  const [username, setUsername] = useState<string | null>(null);

  const loadTrackerDetails = async () => {
    setLoading(true);

    setAuthUrls(
      await ipcRenderer.invoke(ipcChannels.TRACKER.GET_AUTH_URLS).catch((e) => console.error(e)),
    );
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

  const submitAccessCode = async () => {
    setLoading(true);

    await ipcRenderer
      .invoke(ipcChannels.TRACKER.GET_TOKEN, props.trackerMetadata.id, accessCode)
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
            <DefaultButton
              ml="sm"
              variant="default"
              leftSection={<IconExternalLink />}
              onClick={() => shell.openExternal(authUrls[props.trackerMetadata.id])}
            >
              Authenticate on {props.trackerMetadata.name}
            </DefaultButton>
          </Timeline.Item>
          <Timeline.Item bullet={2}>
            <DefaultInput
              ml="sm"
              style={{ maxWidth: 280 }}
              placeholder="Paste access code..."
              value={accessCode || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccessCode(e.target.value)}
            />
          </Timeline.Item>
          <Timeline.Item bullet={3}>
            <DefaultButton variant={'default'} ml="sm" onClick={() => submitAccessCode()}>
              Submit
            </DefaultButton>
          </Timeline.Item>
        </DefaultTimeline>
      </Accordion.Panel>
    </>
  );
};

export default TrackerAuthOAuth;
