import React, { useEffect, useState } from 'react';
const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';
import storeKeys from '@/common/constants/storeKeys.json';
import persistantStore from '../../util/persistantStore';
import { ExtensionMetadata, SettingType } from '@tiyo/common';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@houdoku/ui/components/Dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@houdoku/ui/components/Accordion';
import { Loader2 } from 'lucide-react';
import { Switch } from '@houdoku/ui/components/Switch';
import { Input } from '@houdoku/ui/components/Input';
import { Button } from '@houdoku/ui/components/Button';

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
  showing: boolean;
  setShowing: (showing: boolean) => void;
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
        return <Switch checked={curVal} onCheckedChange={(checked) => onChangeFn(checked)} />;
      case SettingType.STRING:
        return (
          <Input
            className="max-w-52"
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
        <AccordionItem key={extensionId} value={extensionId}>
          <AccordionTrigger className="hover:no-underline">{extensionName}</AccordionTrigger>
          <AccordionContent>
            {settingKeys.map((key) => (
              <div className="w-full flex justify-between items-center mb-2 space-x-2" key={key}>
                <span className="font-medium">{key}</span>
                {renderControl(
                  settingTypes[key],
                  settingsMap[extensionId][key],
                  (newValue: unknown) => updateSetting(extensionId, key, newValue),
                )}
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      );
    });
  };

  useEffect(() => {
    if (props.showing) {
      setLoading(true);
      loadExtensionSettings()
        .finally(() => setLoading(false))
        .catch(console.error);
    }
  }, [props.showing]);

  return (
    <Dialog open={props.showing} onOpenChange={props.setShowing} defaultOpen={false}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tiyo settings</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="w-full flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <Accordion type="single" collapsible>
            {renderRows()}
          </Accordion>
        )}
        <DialogFooter>
          <Button variant={'secondary'} onClick={() => props.setShowing(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={() => saveExtensionSettings().then(() => props.setShowing(false))}
          >
            Save settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PluginSettingsModal;
