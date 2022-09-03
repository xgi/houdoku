import React from 'react';
import { ipcRenderer } from 'electron';
import { Title, Text, Button } from '@mantine/core';
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
        Houdoku is a desktop manga reader. To add a series to your library, click the &quot;Add
        Series&quot; tab on the left panel and search for the series from a supported content
        source.
      </Text>
      <Text pb="xs">
        This app does not host manga -- it retrieves them from public websites (&quot;content
        sources&quot;). Support for content sources is provided through various extensions, which
        can be installed/updated from the Extensions tab. You can select which content source to use
        for each series on the Add Series page.
      </Text>
      <Text pb="xs">
        Houdoku is open source. Please report issues or request features on GitHub.
      </Text>
      <Text>
        Website:{' '}
        <a href={packageJson.homepage} target="_blank" rel="noreferrer">
          {packageJson.homepage}
        </a>
      </Text>
      <Text>
        Documentation:{' '}
        <a href={`${packageJson.homepage}/docs`} target="_blank" rel="noreferrer">
          {packageJson.homepage}/docs
        </a>
      </Text>
      <Text>
        Repository:{' '}
        <a href={packageJson.repository.url} target="_blank" rel="noreferrer">
          {packageJson.repository.url}
        </a>
      </Text>
      <Text>
        License: MIT (
        <a
          href={`${packageJson.repository.url}/blob/master/LICENSE.txt`}
          target="_blank"
          rel="noreferrer"
        >
          view text
        </a>
        )
      </Text>
    </>
  );
};

export default About;
