import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { Table, Button, Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import {
  RegistrySearchResults,
  RegistrySearchPackage,
} from 'aki-plugin-manager';
import { gt } from 'semver';
import { connect, ConnectedProps } from 'react-redux';
import {
  ExtensionMetadata,
  Language,
  LanguageKey,
  Languages,
} from 'houdoku-extension-lib';
import { ExtensionTableRow } from '../../models/types';
import { RootState } from '../../store';
import { setStatusText } from '../../features/statusbar/actions';
import ipcChannels from '../../constants/ipcChannels.json';

const mapState = (state: RootState) => ({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {
  registryResults: RegistrySearchResults;
  filterText: string;
  showExtensionSettingsModal: (extensionId: string) => void;
};

const ExtensionTable: React.FC<Props> = (props: Props) => {
  const [dataSource, setDataSource] = useState<ExtensionTableRow[]>([]);

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

          return {
            pkgName: pkg.name,
            friendlyName: description.name,
            id: description.id,
            availableVersion: pkg.version,
            url: description.url,
            languageKey:
              !('translatedLanguage' in description) ||
              description.translatedLanguage === ''
                ? undefined
                : description.translatedLanguage,
            installedVersion,
            canUpdate,
            hasSettings: metadata ? metadata.hasSettings : false,
          };
        })
        .filter((row: ExtensionTableRow) => {
          if (props.filterText === '') return true;
          return (
            row.friendlyName.includes(props.filterText) ||
            row.url.includes(props.filterText)
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

  const handleInstall = (
    pkgName: string,
    friendlyName: string,
    version: string
  ) => {
    props.setStatusText(`Installing extension ${friendlyName}@${version} ...`);

    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.INSTALL, pkgName, version)
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD))
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.LIST))
      .then((extensionDetailsList: [string, string][]) => {
        return (
          extensionDetailsList.find(
            (_details: [string, string]) => _details[0] === pkgName
          ) !== undefined
        );
      })
      .then((loaded: boolean) => {
        props.setStatusText(
          loaded
            ? `Successfully installed and loaded extension ${friendlyName}@${version}`
            : `Could not load extension ${friendlyName}@${version}`
        );
        return loaded;
      })
      .then(() => updateDataSource())
      .catch((e) => log.error(e));
  };

  const handleRemove = (pkgName: string, friendlyName: string) => {
    props.setStatusText(`Removing extension ${friendlyName}...`);

    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.UNINSTALL, pkgName)
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.RELOAD))
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.LIST))
      .then((extensionDetailsList: [string, string][]) => {
        return (
          extensionDetailsList.find(
            (_details: [string, string]) => _details[0] === pkgName
          ) !== undefined
        );
      })
      .then((loaded: boolean) => {
        props.setStatusText(
          loaded
            ? `Failed to remove extension ${friendlyName}`
            : `Successfully removed extension ${friendlyName}`
        );
        return loaded;
      })
      .then(() => updateDataSource())
      .catch((e) => log.error(e));
  };

  useEffect(() => {
    updateDataSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.registryResults, props.filterText]);

  const columns = [
    {
      title: '◇',
      dataIndex: 'language',
      key: 'language',
      width: '5%',
      filters: Object.values(Languages).map((language: Language) => {
        return { text: language.name, value: language.key };
      }),
      filteredValue: undefined,
      onFilter: (value: string | number | boolean, record: ExtensionTableRow) =>
        value === undefined || record.languageKey === value,
      render: function render(_text: string, record: ExtensionTableRow) {
        if (
          record.languageKey === undefined ||
          Languages[record.languageKey] === undefined ||
          record.languageKey === LanguageKey.MULTI
        ) {
          return <></>;
        }
        return (
          <div
            title={Languages[record.languageKey].name}
            className={`flag flag-${Languages[record.languageKey].flagCode}`}
          />
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'friendlyName',
      key: 'friendlyName',
      width: '20%',
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: '30%',
    },
    {
      title: 'Latest',
      dataIndex: 'availableVersion',
      key: 'availableVersion',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Current',
      dataIndex: 'installedVersion',
      key: 'installedVersion',
      width: '10%',
      align: 'center',
    },
    {
      title: '',
      key: 'removeButton',
      width: '10%',
      align: 'center',
      render: function render(text: any, record: ExtensionTableRow) {
        return record.installedVersion === undefined ? (
          <></>
        ) : (
          <Button
            type="primary"
            danger
            onClick={() => handleRemove(record.pkgName, record.friendlyName)}
          >
            Remove
          </Button>
        );
      },
    },
    {
      title: '',
      key: 'installUpdateButton',
      width: '10%',
      align: 'center',
      render: function render(text: any, record: ExtensionTableRow) {
        if (record.installedVersion === undefined) {
          return (
            <Button
              onClick={() =>
                handleInstall(
                  record.pkgName,
                  record.friendlyName,
                  record.availableVersion
                )
              }
            >
              Install
            </Button>
          );
        }
        return record.canUpdate ? (
          <Button
            type="primary"
            onClick={() =>
              handleInstall(
                record.pkgName,
                record.friendlyName,
                record.availableVersion
              )
            }
          >
            Update
          </Button>
        ) : (
          <></>
        );
      },
    },
    {
      title: '',
      key: 'settingsButton',
      width: '5%',
      align: 'center',
      render: function render(text: any, record: ExtensionTableRow) {
        return record.installedVersion === undefined || !record.hasSettings ? (
          <></>
        ) : (
          <Button
            shape="circle"
            icon={
              <SettingOutlined
                onClick={() => props.showExtensionSettingsModal(record.id)}
              />
            }
          />
        );
      },
    },
  ];

  return (
    <Table
      dataSource={dataSource}
      // @ts-expect-error cleanup column render types
      columns={columns}
      rowKey="pkgName"
      size="small"
    />
  );
};

export default connector(ExtensionTable);
