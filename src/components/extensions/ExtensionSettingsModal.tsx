import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { SettingType } from 'houdoku-extension-lib';
import { Button, Group, Modal, Switch, Text } from '@mantine/core';
import ipcChannels from '../../constants/ipcChannels.json';
import storeKeys from '../../constants/storeKeys.json';
import persistantStore from '../../util/persistantStore';

type Props = {
  visible: boolean;
  toggleVisible: () => void;
  extensionId: string;
};

const ExtensionSettingsModal: React.FC<Props> = (props: Props) => {
  const [extensionSettingTypes, setExtensionSettingTypes] = useState<{
    [key: string]: SettingType;
  }>({});
  const [extensionSettings, setExtensionSettings] = useState<{
    [key: string]: any;
  }>({});

  const loadExtensionSettings = async () => {
    setExtensionSettings({});
    log.debug(`Extension settings modal loading client for ${extensionSettings}`);

    setExtensionSettingTypes(
      await ipcRenderer.invoke(ipcChannels.EXTENSION.GET_SETTING_TYPES, props.extensionId)
    );
    setExtensionSettings(
      await ipcRenderer.invoke(ipcChannels.EXTENSION.GET_SETTINGS, props.extensionId)
    );
  };

  const saveExtensionSettings = async () => {
    await ipcRenderer.invoke(
      ipcChannels.EXTENSION.SET_SETTINGS,
      props.extensionId,
      extensionSettings
    );
    persistantStore.write(
      `${storeKeys.EXTENSION_SETTINGS_PREFIX}${props.extensionId}`,
      JSON.stringify(extensionSettings)
    );
    props.toggleVisible();
  };

  const renderControl = (
    settingType: SettingType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    curVal: any,
    onChangeFn: (newValue: unknown) => void
  ) => {
    switch (settingType) {
      case SettingType.BOOLEAN:
        return <Switch defaultChecked={curVal} onChange={(e) => onChangeFn(e.target.checked)} />;
      default:
        return <></>;
    }
  };

  const renderRows = () => {
    return Object.keys(extensionSettings).map((key: string) => {
      return (
        <Group position="apart" mb="xs" key={key}>
          <Text>{key}</Text>
          {renderControl(extensionSettingTypes[key], extensionSettings[key], (newValue: unknown) =>
            setExtensionSettings({ ...extensionSettings, [key]: newValue })
          )}
        </Group>
      );
    });
  };

  useEffect(() => {
    if (props.visible && props.extensionId !== '') {
      loadExtensionSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.visible, props.extensionId]);

  return (
    <Modal title="Extension Settings" opened={props.visible} onClose={props.toggleVisible}>
      {renderRows()}
      <Group position="right" mt="sm">
        <Button variant="default" onClick={props.toggleVisible}>
          Cancel
        </Button>
        <Button onClick={saveExtensionSettings}>Save Settings</Button>
      </Group>
    </Modal>
  );
};

export default ExtensionSettingsModal;
