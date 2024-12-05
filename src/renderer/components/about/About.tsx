import React, { useState } from 'react';
const { ipcRenderer } = require('electron');
import { Group } from '@mantine/core';
import packageJson from '../../../../package.json';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { IconGitFork, IconHome, IconNotebook, IconScale } from '@tabler/icons';
import DefaultText from '../general/DefaultText';
import DefaultButton from '../general/DefaultButton';
import DefaultTitle from '../general/DefaultTitle';

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
        <DefaultTitle order={2} pb="xs">
          {packageJson.productName} v{packageJson.version}
        </DefaultTitle>
        <DefaultButton size="xs" onClick={handleUpdateCheck} loading={checkingForUpdate}>
          Check for Updates
        </DefaultButton>
      </Group>

      <DefaultText pb="xs" pt="md">
        Houdoku is a desktop manga reader. To add a series to your library, click the{' '}
        <DefaultText component="span" c="teal" fw={700}>
          Add Series
        </DefaultText>{' '}
        tab on the left panel and search for the series from a supported content source. To add more
        content sources, install a{' '}
        <DefaultText component="span" c="violet" fw={700}>
          Plugin
        </DefaultText>
        .
      </DefaultText>
      <DefaultText pb="xs">
        Houdoku is open source. Please report issues or request features on GitHub.
      </DefaultText>
      <Group gap="xs" pt="md">
        <DefaultButton
          oc="teal"
          leftSection={<IconHome size={18} />}
          component="a"
          href={packageJson.homepage}
          target="_blank"
          rel="noreferrer"
        >
          Official Website
        </DefaultButton>
        <DefaultButton
          oc="blue"
          leftSection={<IconNotebook size={18} />}
          component="a"
          href={`${packageJson.homepage}/docs`}
          target="_blank"
          rel="noreferrer"
        >
          Documentation
        </DefaultButton>
        <DefaultButton
          oc="grape"
          leftSection={<IconGitFork size={18} />}
          component="a"
          href={packageJson.repository.url}
          target="_blank"
          rel="noreferrer"
        >
          Repository
        </DefaultButton>
        <DefaultButton
          oc="gray"
          leftSection={<IconScale size={18} />}
          component="a"
          href={`${packageJson.repository.url}/blob/master/LICENSE.txt`}
          target="_blank"
          rel="noreferrer"
        >
          License
        </DefaultButton>
      </Group>
    </>
  );
};

export default About;
