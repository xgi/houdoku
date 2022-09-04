import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { RegistrySearchResults, RegistrySearchPackage } from 'aki-plugin-manager';
import { gt } from 'semver';
import { ExtensionMetadata, LanguageKey, Languages } from 'houdoku-extension-lib';
import { ActionIcon, Button, Group, Mark, ScrollArea, Table, Text } from '@mantine/core';
import { IconSettings, IconTrash } from '@tabler/icons';
import { useListState } from '@mantine/hooks';
import { ExtensionTableRow } from '../../models/types';
import ipcChannels from '../../constants/ipcChannels.json';
import flags from '../../img/flags.png';

type Props = {
  registryResults: RegistrySearchResults;
  filterText: string;
  showExtensionSettingsModal: (extensionId: string) => void;
};

const ExtensionTable: React.FC<Props> = (props: Props) => {
  const [dataSource, setDataSource] = useState<ExtensionTableRow[]>([]);
  const [installingExtensions, installingExtensionsHandlers] = useListState<string>([]);

  const updateDataSource = async () => {
    if (props.registryResults === undefined) {
      setDataSource([]);
      return;
    }

    const metadataList: ExtensionMetadata[] = await ipcRenderer.invoke(
      ipcChannels.EXTENSION_MANAGER.GET_ALL
    );

    setDataSource(
      props.registryResults.objects
        .map((object: any) => {
          const pkg: RegistrySearchPackage = object.package;
          const description = JSON.parse(pkg.description);

          let installedVersion;
          let canUpdate = false;
          const metadata = metadataList.find(
            (_metadata: ExtensionMetadata) => _metadata.id === description.id
          );
          if (metadata !== undefined) {
            installedVersion = metadata.version;
            canUpdate = gt(pkg.version, installedVersion);
          }

          const languageKey =
            !('translatedLanguage' in description) || description.translatedLanguage === ''
              ? undefined
              : description.translatedLanguage;

          return {
            pkgName: pkg.name,
            friendlyName: description.name,
            id: description.id,
            availableVersion: pkg.version,
            url: description.url,
            languageKey,
            installedVersion,
            canUpdate,
            hasSettings: metadata ? metadata.hasSettings : false,
          };
        })
        .filter((row: ExtensionTableRow) => {
          if (props.filterText === '') return true;
          return (
            row.friendlyName.toLowerCase().includes(props.filterText.toLowerCase()) ||
            row.url.toLowerCase().includes(props.filterText.toLowerCase())
          );
        })
        .sort((a: ExtensionTableRow, b: ExtensionTableRow) => {
          if (a.installedVersion !== undefined) {
            if (b.installedVersion !== undefined) {
              return a.pkgName.localeCompare(b.pkgName);
            }
            return -1;
          }
          if (b.installedVersion !== undefined) {
            return 1;
          }
          return a.pkgName.localeCompare(b.pkgName);
        })
    );
  };

  const handleInstall = (pkgName: string, friendlyName: string, version: string) => {
    log.info(`Installing extension ${friendlyName}@${version} ...`);
    installingExtensionsHandlers.append(pkgName);

    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.INSTALL, pkgName, version)
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD))
      .then(() => updateDataSource())
      .catch((e) => log.error(e))
      .finally(() => installingExtensionsHandlers.filter((item) => item !== pkgName))
      .catch((e) => log.error(e));
  };

  const handleRemove = (pkgName: string, friendlyName: string) => {
    log.info(`Removing extension ${friendlyName}...`);

    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.UNINSTALL, pkgName)
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD))
      .then(() => updateDataSource())
      .catch((e) => log.error(e));
  };

  useEffect(() => {
    updateDataSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.registryResults, props.filterText]);

  const renderFlag = (row: ExtensionTableRow) => {
    if (
      row.languageKey === undefined ||
      Languages[row.languageKey] === undefined ||
      row.languageKey === LanguageKey.MULTI
    ) {
      return <></>;
    }
    return (
      <div className="flag-container">
        <img
          src={flags}
          title={Languages[row.languageKey].name}
          alt={Languages[row.languageKey].name}
          className={`flag flag-${Languages[row.languageKey].flagCode}`}
        />
      </div>
    );
  };

  const renderRows = () => {
    return dataSource.map((row) => {
      return (
        <tr>
          <td>{renderFlag(row)}</td>
          <td>{row.friendlyName}</td>
          <td>{row.url}</td>
          <td>
            <Text align="center">
              {row.availableVersion === row.installedVersion || !row.installedVersion ? (
                row.availableVersion
              ) : (
                <Text>
                  {row.installedVersion}→<Mark color="teal">{row.availableVersion}</Mark>
                </Text>
              )}
            </Text>
          </td>
          <td>
            <Group spacing="xs" position="right">
              {row.canUpdate ? (
                <Button
                  onClick={() => handleInstall(row.pkgName, row.friendlyName, row.availableVersion)}
                >
                  Update
                </Button>
              ) : (
                ''
              )}
              {row.hasSettings && row.installedVersion ? (
                <ActionIcon
                  variant="default"
                  size="lg"
                  onClick={() => props.showExtensionSettingsModal(row.id)}
                >
                  <IconSettings size={20} />
                </ActionIcon>
              ) : (
                ''
              )}
              {row.installedVersion === undefined ? (
                <Button
                  variant="default"
                  onClick={() => handleInstall(row.pkgName, row.friendlyName, row.availableVersion)}
                >
                  {installingExtensions.includes(row.pkgName) ? 'Installing...' : 'Install'}
                </Button>
              ) : (
                <ActionIcon
                  variant="filled"
                  color="red"
                  size="lg"
                  onClick={() => handleRemove(row.pkgName, row.friendlyName)}
                >
                  <IconTrash size={20} />
                </ActionIcon>
              )}
            </Group>
          </td>
        </tr>
      );
    });
  };

  return (
    <ScrollArea style={{ height: 'calc(100vh - 24px - 72px)' }} pr="xl" mr={-16}>
      <Table>
        <thead>
          <tr>
            <th> </th>
            <th>Name</th>
            <th>URL</th>
            <th>
              <Text align="center">Version</Text>
            </th>
            <th> </th>
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </Table>
    </ScrollArea>
  );
};

export default ExtensionTable;
