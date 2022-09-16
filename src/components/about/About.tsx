import React from 'react';
import { ipcRenderer } from 'electron';
import { Title, Text, Button, Mark } from '@mantine/core';
import packageJson from '../../../package.json';
import ipcChannels from '../../constants/ipcChannels.json';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const About: React.FC<Props> = (props: Props) => {
  const handleUpdateCheck = () => {
    ipcRenderer.invoke(ipcChannels.APP.CHECK_FOR_UPDATES);
  };

  return (
    <>
      <Title order={2} pb="xs">
        {packageJson.productName} v{packageJson.version}
      </Title>
      <Button onClick={handleUpdateCheck}>Check for Updates</Button>
      <Text pb="xs" pt="xs">
        Houdoku is a desktop manga reader. To add a series to your library, click the{' '}
        <Text component="span" color="teal" weight={700}>
          Add Series
        </Text>{' '}
        tab on the left panel and search for the series from a supported content source.
      </Text>
      <Text pb="xs">
        This app does not host manga, it retrieves them from public websites (&quot;content
        sources&quot;). Support for content sources is provided through various extensions, which
        can be installed/updated from the{' '}
        <Text component="span" color="violet" weight={700}>
          Extensions
        </Text>{' '}
        tab.
      </Text>
      <Text pb="xs">
        Houdoku is open source. Please report issues or request features on GitHub.
      </Text>
      <Text>
        Website:{' '}
        <Text
          variant="link"
          component="a"
          href={packageJson.homepage}
          target="_blank"
          rel="noreferrer"
        >
          {packageJson.homepage}
        </Text>
      </Text>
      <Text>
        Documentation:{' '}
        <Text
          variant="link"
          component="a"
          href={`${packageJson.homepage}/docs`}
          target="_blank"
          rel="noreferrer"
        >
          {packageJson.homepage}/docs
        </Text>
      </Text>
      <Text>
        Repository:{' '}
        <Text
          variant="link"
          component="a"
          href={packageJson.repository.url}
          target="_blank"
          rel="noreferrer"
        >
          {packageJson.repository.url}
        </Text>
      </Text>
      <Text>
        License: MIT (
        <Text
          variant="link"
          component="a"
          href={`${packageJson.repository.url}/blob/master/LICENSE.txt`}
          target="_blank"
          rel="noreferrer"
        >
          view text
        </Text>
        )
      </Text>
    </>
  );
};

export default About;
