import React, { useEffect, useState } from 'react';
const aki = require('aki-plugin-manager');
import { useLocation } from 'react-router-dom';
import { Button, Group, Mark, Table, Text } from '@mantine/core';
const { ipcRenderer } = require('electron');
import { gt } from 'semver';
import { useListState } from '@mantine/hooks';
import ipcChannels from '@/common/constants/ipcChannels.json';
import PluginSettingsModal from './PluginSettingsModal';
import DefaultText from '../general/DefaultText';
import DefaultButton from '../general/DefaultButton';

const Plugins: React.FC = () => {
  const [currentTiyoVersion, setCurrentTiyoVersion] = useState<string | undefined>(undefined);
  const [availableTiyoVersion, setAvailableTiyoVersion] = useState<string | undefined>(undefined);
  const [showingSettingsModal, setShowingSettingsModal] = useState(false);

  const [installingPlugins, installingPluginsHandlers] = useListState<string>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [reloading, setReloading] = useState(false);
  const location = useLocation();

  const refreshMetadata = async () => {
    setRefreshing(true);
    setCurrentTiyoVersion(undefined);
    setAvailableTiyoVersion(undefined);

    const currentVersion = await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.GET_TIYO_VERSION);
    setCurrentTiyoVersion(currentVersion);

    await aki
      .search('core', 'tiyo', 1)
      // biome-ignore lint/suspicious/noExplicitAny: TODO external schema
      .then((results: any) => {
        if (results.objects.length > 0) {
          setAvailableTiyoVersion(results.objects[0].package.version);
        }
      })
      .catch(console.error);
    setRefreshing(false);
  };

  const handleInstall = (pkgName: string, version: string) => {
    console.info(`Installing plugin ${pkgName}@${version}`);
    installingPluginsHandlers.append(pkgName);

    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.INSTALL, pkgName, version)
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD))
      .then(() => refreshMetadata())
      .catch((e) => console.error(e))
      .finally(() => installingPluginsHandlers.filter((item) => item !== pkgName))
      .catch((e) => console.error(e));
  };

  const handleRemove = (pkgName: string) => {
    console.info(`Removing plugin ${pkgName}...`);

    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.UNINSTALL, pkgName)
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD))
      .then(() => refreshMetadata())
      .catch((e) => console.error(e));
  };

  const reloadPlugins = async () => {
    setReloading(true);
    await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD).catch((e) => console.error(e));
    setReloading(false);
    refreshMetadata();
  };

  useEffect(() => {
    refreshMetadata();
  }, [location]);

  const tiyoCanUpdate =
    currentTiyoVersion && availableTiyoVersion && gt(currentTiyoVersion, availableTiyoVersion);

  return (
    <>
      <PluginSettingsModal
        visible={showingSettingsModal}
        toggleVisible={() => setShowingSettingsModal(!showingSettingsModal)}
      />

      <Group align="left" pt="sm" mb="md" gap="sm" wrap="nowrap">
        <DefaultButton oc="blue" loading={refreshing} onClick={() => refreshMetadata()}>
          Check for Updates
        </DefaultButton>
        <DefaultButton
          variant="default"
          loading={reloading}
          onClick={() => reloadPlugins()}
          disabled={currentTiyoVersion === undefined}
        >
          Reload Installed Plugins
        </DefaultButton>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <DefaultText fw="bold">Name</DefaultText>
            </Table.Th>
            <Table.Th>
              <DefaultText fw="bold">Description</DefaultText>
            </Table.Th>
            <Table.Th>
              <Text ta="center">
                <DefaultText fw="bold">Version</DefaultText>
              </Text>
            </Table.Th>
            <Table.Th> </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>
              <DefaultText>Tiyo Extension Manager</DefaultText>
            </Table.Td>
            <Table.Td>
              <DefaultText>
                Adds support for importing content from other sources, including 3rd-party websites.
              </DefaultText>
            </Table.Td>
            <Table.Td>
              <DefaultText ta="center">
                {availableTiyoVersion === currentTiyoVersion || !currentTiyoVersion ? (
                  availableTiyoVersion
                ) : (
                  <>
                    {currentTiyoVersion}→<Mark color="teal">{availableTiyoVersion}</Mark>
                  </>
                )}
              </DefaultText>
            </Table.Td>
            <Table.Td>
              <Group gap="xs" wrap="nowrap">
                {currentTiyoVersion !== undefined ? (
                  <DefaultButton variant="default" onClick={() => setShowingSettingsModal(true)}>
                    Settings
                  </DefaultButton>
                ) : undefined}

                {tiyoCanUpdate ? (
                  <Button onClick={() => handleInstall('@tiyo/core', availableTiyoVersion)}>
                    Update
                  </Button>
                ) : undefined}
                {currentTiyoVersion === undefined && availableTiyoVersion !== undefined ? (
                  <DefaultButton
                    loading={installingPlugins.includes('@tiyo/core')}
                    variant="default"
                    onClick={() => handleInstall('@tiyo/core', availableTiyoVersion)}
                  >
                    {installingPlugins.includes('@tiyo/core') ? 'Installing...' : 'Install'}
                  </DefaultButton>
                ) : (
                  <Button variant="filled" color="red" onClick={() => handleRemove('@tiyo/core')}>
                    Uninstall
                  </Button>
                )}
              </Group>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </>
  );
};

export default Plugins;
