import React, { useEffect, useState } from 'react';
const { ipcRenderer } = require('electron');
import {
  Accordion,
  Button,
  Center,
  Group,
  Input,
  Loader,
  Modal,
  Stack,
  Switch,
  Text,
} from '@mantine/core';
import ipcChannels from '@/common/constants/ipcChannels.json';
import storeKeys from '@/common/constants/storeKeys.json';
import persistantStore from '../../util/persistantStore';
import { ExtensionMetadata, SettingType } from '@tiyo/common';

type SettingTypes = {
  [key: string]: SettingType;
};

type Settings = {
  // biome-ignore lint/suspicious/noExplicitAny: arbitrary schema
  [key: string]: any;
};

type SettingTypesMap = { [extensionId: string]: SettingTypes };
type SettingsMap = { [extensionId: string]: Settings };

type Props = {
  visible: boolean;
  toggleVisible: () => void;
};

const PluginSettingsModal: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [extensions, setExtensions] = useState<ExtensionMetadata[]>([]);
  const [settingTypesMap, setSettingTypesMap] = useState<SettingTypesMap>({});
  const [settingsMap, setSettingsMap] = useState<SettingsMap>({});

  const loadExtensionSettings = async () => {
    const newExtensions: ExtensionMetadata[] = await ipcRenderer.invoke(
      ipcChannels.EXTENSION_MANAGER.GET_ALL,
    );

    const newSettingTypesMap: SettingTypesMap = {};
    const newSettingsMap: SettingsMap = {};

    for (const extension of newExtensions) {
      const settingTypes = await ipcRenderer.invoke(
        ipcChannels.EXTENSION.GET_SETTING_TYPES,
        extension.id,
      );

      if (Object.keys(settingTypes).length > 0) {
        const settings = await ipcRenderer.invoke(ipcChannels.EXTENSION.GET_SETTINGS, extension.id);
        newSettingTypesMap[extension.id] = settingTypes;
        newSettingsMap[extension.id] = settings;
      }
    }

    setExtensions(newExtensions);
    setSettingTypesMap(newSettingTypesMap);
    setSettingsMap(newSettingsMap);
  };

  const updateSetting = (extensionId: string, key: string, value: unknown) => {
    const newSettingsMap = { ...settingsMap };

    newSettingsMap[extensionId][key] = value;
    setSettingsMap(newSettingsMap);
  };

  const saveExtensionSettings = async () => {
    for (const extension of extensions) {
      await ipcRenderer.invoke(
        ipcChannels.EXTENSION.SET_SETTINGS,
        extension.id,
        settingsMap[extension.id],
      );
      persistantStore.write(
        `${storeKeys.EXTENSION_SETTINGS_PREFIX}${extension.id}`,
        JSON.stringify(settingsMap[extension.id]),
      );
    }
  };

  const renderControl = (
    settingType: SettingType,
    // biome-ignore lint/suspicious/noExplicitAny: arbitrary schema
    curVal: any,
    onChangeFn: (newValue: unknown) => void,
  ) => {
    switch (settingType) {
      case SettingType.BOOLEAN:
        return <Switch defaultChecked={curVal} onChange={(e) => onChangeFn(e.target.checked)} />;
      case SettingType.STRING:
        return (
          <Input
            value={curVal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeFn(e.target.value)}
          />
        );
      default:
        return <></>;
    }
  };

  const renderRows = () => {
    return Object.entries(settingTypesMap).map(([extensionId, settingTypes]) => {
      const extensionName = extensions.find((ext) => ext.id === extensionId)?.name;
      const settingKeys = Object.keys(settingTypes);

      return (
        <Accordion.Item key={extensionId} value={extensionId}>
          <Accordion.Control>{extensionName}</Accordion.Control>
          <Accordion.Panel>
            {settingKeys.map((key) => (
              <Group justify="space-between" mb="xs" key={key}>
                <Text>{key}</Text>
                {renderControl(
                  settingTypes[key],
                  settingsMap[extensionId][key],
                  (newValue: unknown) => updateSetting(extensionId, key, newValue),
                )}
              </Group>
            ))}
          </Accordion.Panel>
        </Accordion.Item>
      );
    });
  };

  useEffect(() => {
    if (props.visible) {
      setLoading(true);
      loadExtensionSettings()
        .finally(() => setLoading(false))
        .catch(console.error);
    }
  }, [props.visible]);

  return (
    <Modal
      title="Tiyo Settings"
      opened={props.visible}
      onClose={props.toggleVisible}
      closeOnClickOutside={false}
    >
      {loading ? (
        <Center h="100%" mx="auto">
          <Stack align="center">
            <Loader />
          </Stack>
        </Center>
      ) : (
        <>
          <Accordion>{renderRows()}</Accordion>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={props.toggleVisible}>
              Cancel
            </Button>
            <Button onClick={() => saveExtensionSettings().then(() => props.toggleVisible())}>
              Save Settings
            </Button>
          </Group>
        </>
      )}
    </Modal>
  );
};

export default PluginSettingsModal;
