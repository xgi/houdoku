import React, { useState } from 'react';
const { ipcRenderer } = require('electron');
import { Title, Text, Button, Group } from '@mantine/core';
import packageJson from '../../../../package.json';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { IconGitFork, IconHome, IconNotebook, IconScale } from '@tabler/icons';

const About: React.FC = () => {
  const [checkingForUpdate, setCheckingForUpdate] = useState(false);

  const handleUpdateCheck = () => {
    setCheckingForUpdate(true);
    ipcRenderer
      .invoke(ipcChannels.APP.CHECK_FOR_UPDATES)
      .finally(() => setCheckingForUpdate(false))
      .catch(console.error);
  };

  return (
    <>
      <Group pt="sm" justify="space-between">
        <Title order={2} pb="xs">
          {packageJson.productName} v{packageJson.version}
        </Title>
        <Button size="xs" onClick={handleUpdateCheck} loading={checkingForUpdate}>
          Check for Updates
        </Button>
      </Group>

      <Text pb="xs" pt="md">
        Houdoku is a desktop manga reader. To add a series to your library, click the{' '}
        <Text component="span" c="teal" fw={700}>
          Add Series
        </Text>{' '}
        tab on the left panel and search for the series from a supported content source. To add more
        content sources, install a{' '}
        <Text component="span" c="violet" fw={700}>
          Plugin
        </Text>
        .
      </Text>
      <Text pb="xs">
        Houdoku is open source. Please report issues or request features on GitHub.
      </Text>
      <Group gap="xs" pt="md">
        <Button
          color="teal"
          leftSection={<IconHome size={18} />}
          component="a"
          href={packageJson.homepage}
          target="_blank"
          rel="noreferrer"
        >
          Official Website
        </Button>
        <Button
          color="blue"
          leftSection={<IconNotebook size={18} />}
          component="a"
          href={`${packageJson.homepage}/docs`}
          target="_blank"
          rel="noreferrer"
        >
          Documentation
        </Button>
        <Button
          color="grape"
          leftSection={<IconGitFork size={18} />}
          component="a"
          href={packageJson.repository.url}
          target="_blank"
          rel="noreferrer"
        >
          Repository
        </Button>
        <Button
          color="gray"
          leftSection={<IconScale size={18} />}
          component="a"
          href={`${packageJson.repository.url}/blob/master/LICENSE.txt`}
          target="_blank"
          rel="noreferrer"
        >
          License
        </Button>
      </Group>
    </>
  );
};

export default About;
