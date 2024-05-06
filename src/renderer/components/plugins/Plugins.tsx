import React, { useEffect, useState } from 'react';
const aki = require('aki-plugin-manager');
import { useLocation } from 'react-router-dom';
import { Button, Group, Mark, Table, Text } from '@mantine/core';
const { ipcRenderer } = require('electron');
import { gt } from 'semver';
import { useListState } from '@mantine/hooks';
import ipcChannels from '@/common/constants/ipcChannels.json';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const Plugins: React.FC<Props> = () => {
  const [currentTiyoVersion, setCurrentTiyoVersion] = useState<string | undefined>(undefined);
  const [availableTiyoVersion, setAvailableTiyoVersion] = useState<string | undefined>(undefined);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <Group align="left" mb="md" gap="sm" wrap="nowrap">
        <Button loading={refreshing} onClick={() => refreshMetadata()}>
          Check for Updates
        </Button>
        <Button
          variant="default"
          loading={reloading}
          onClick={() => reloadPlugins()}
          disabled={currentTiyoVersion === undefined}
        >
          Reload Installed Plugins
        </Button>
      </Group>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>
              <Text ta="center">Version</Text>
            </th>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Text size="md">Tiyo Extension Manager</Text>
            </td>
            <td>
              <Text size="md">
                Adds support for importing content from other sources, including 3rd-party websites.
              </Text>
            </td>
            <td>
              <Text size="md" ta="center">
                {availableTiyoVersion === currentTiyoVersion || !currentTiyoVersion ? (
                  availableTiyoVersion
                ) : (
                  <>
                    {currentTiyoVersion}→<Mark color="teal">{availableTiyoVersion}</Mark>
                  </>
                )}
              </Text>
            </td>
            <td>
              <Group gap="xs">
                {tiyoCanUpdate ? (
                  <Button onClick={() => handleInstall('@tiyo/core', availableTiyoVersion)}>
                    Update
                  </Button>
                ) : (
                  ''
                )}
                {currentTiyoVersion === undefined && availableTiyoVersion !== undefined ? (
                  <Button
                    loading={installingPlugins.includes('@tiyo/core')}
                    variant="default"
                    onClick={() => handleInstall('@tiyo/core', availableTiyoVersion)}
                  >
                    {installingPlugins.includes('@tiyo/core') ? 'Installing...' : 'Install'}
                  </Button>
                ) : (
                  <Button variant="filled" color="red" onClick={() => handleRemove('@tiyo/core')}>
                    Uninstall
                  </Button>
                )}
              </Group>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};

export default Plugins;
