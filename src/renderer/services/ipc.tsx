const { ipcRenderer } = require('electron');
import { ExtensionMetadata } from '@tiyo/common';
import { Box, Text } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { NotificationData, showNotification, updateNotification } from '@mantine/notifications';
import parse from 'html-react-parser';
import persistantStore from '@/renderer/util/persistantStore';
import ipcChannels from '@/common/constants/ipcChannels.json';
import storeKeys from '@/common/constants/storeKeys.json';
import { TrackerMetadata } from '@/common/models/types';
import { IconCheck, IconX } from '@tabler/icons';
import React, { ReactElement } from 'react';
import { UpdateInfo } from 'electron-updater';

const NOTIFICATION_ICONS = { check: <IconCheck size={16} />, x: <IconX size={16} /> };

export const loadStoredExtensionSettings = () => {
  console.info('Loading stored extension settings...');
  return ipcRenderer
    .invoke(ipcChannels.EXTENSION_MANAGER.GET_ALL)
    .then((metadataList: ExtensionMetadata[]) => {
      metadataList.forEach((metadata: ExtensionMetadata) => {
        const extSettings: string | null = persistantStore.read(
          `${storeKeys.EXTENSION_SETTINGS_PREFIX}${metadata.id}`,
        );
        if (extSettings !== null && extSettings !== 'undefined') {
          console.debug(`Found stored settings for extension ${metadata.id}`);
          ipcRenderer.invoke(
            ipcChannels.EXTENSION.SET_SETTINGS,
            metadata.id,
            JSON.parse(extSettings),
          );
        }
      });
    })
    .catch((e: Error) => console.error(e));
};

export const loadStoredTrackerTokens = () => {
  console.info('Loading stored tracker tokens...');
  return ipcRenderer
    .invoke(ipcChannels.TRACKER_MANAGER.GET_ALL)
    .then((metadataList: TrackerMetadata[]) => {
      metadataList.forEach((metadata: TrackerMetadata) => {
        const token: string | null = persistantStore.read(
          `${storeKeys.TRACKER_ACCESS_TOKEN_PREFIX}${metadata.id}`,
        );
        if (token !== null) {
          console.debug(`Found stored token for tracker ${metadata.id}`);
          ipcRenderer.invoke(ipcChannels.TRACKER.SET_ACCESS_TOKEN, metadata.id, token);
        }
      });
    })
    .catch((e: Error) => console.error(e));
};

export const createRendererIpcHandlers = () => {
  console.debug('Creating renderer IPC handlers...');

  ipcRenderer.on(ipcChannels.APP.LOAD_STORED_EXTENSION_SETTINGS, () => {
    loadStoredExtensionSettings();
  });
  ipcRenderer.on(ipcChannels.WINDOW.SET_FULLSCREEN, (_event, fullscreen) => {
    if (fullscreen) {
      document.getElementById('titlebar')?.classList.add('hidden');
    } else {
      document.getElementById('titlebar')?.classList.remove('hidden');
    }
  });

  ipcRenderer.on(
    ipcChannels.APP.SEND_NOTIFICATION,
    (
      _event,
      props: NotificationData,
      isUpdate = false,
      iconName?: keyof typeof NOTIFICATION_ICONS,
    ) => {
      console.info(`Sending notification: ${props}`);
      const iconNode = iconName !== undefined ? NOTIFICATION_ICONS[iconName] : undefined;

      if (isUpdate && props.id !== undefined) {
        updateNotification({ ...props, id: props.id, icon: iconNode });
      } else {
        showNotification({
          ...props,
          icon: iconNode,
        });
      }
    },
  );

  ipcRenderer.on(ipcChannels.APP.SHOW_PERFORM_UPDATE_DIALOG, (_event, updateInfo: UpdateInfo) => {
    openConfirmModal({
      title: 'Update Available',
      children: (
        <>
          <Text mb="sm">
            Houdoku v{updateInfo.version} was released on{' '}
            {new Date(updateInfo.releaseDate).toLocaleDateString()}.
          </Text>
          <Box bg={'dark.8'} p="xs">
            <Text size="sm">
              {parse(updateInfo.releaseNotes as string, {
                transform(reactNode) {
                  if (React.isValidElement(reactNode) && reactNode.type === 'a') {
                    const newElement = { ...reactNode };
                    newElement.props = { ...newElement.props, target: '_blank' };
                    return newElement;
                  }

                  return reactNode as ReactElement;
                },
              })}
            </Text>
          </Box>
        </>
      ),
      labels: { confirm: 'Download Update', cancel: 'Not now' },
      onCancel: () => console.info('User opted not to perform update'),
      onConfirm: () => ipcRenderer.invoke(ipcChannels.APP.PERFORM_UPDATE),
    });
  });

  ipcRenderer.on(ipcChannels.APP.SHOW_RESTART_UPDATE_DIALOG, () => {
    openConfirmModal({
      title: 'Restart Required',
      children: <Text>Houdoku needs to restart to finish installing updates. Restart now?</Text>,
      labels: { confirm: 'Restart Now', cancel: 'Later' },
      onCancel: () => console.info('User opted not to restart to update'),
      onConfirm: () => ipcRenderer.invoke(ipcChannels.APP.UPDATE_AND_RESTART),
    });
  });
};
