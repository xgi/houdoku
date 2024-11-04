import React, { useState } from 'react';
import { ExtensionMetadata } from '@tiyo/common';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { Flex, Group, Text, Tooltip } from '@mantine/core';
const { ipcRenderer } = require('electron');
import {
  searchExtensionState,
  searchTextState,
  showingFilterDrawerState,
} from '@/renderer/state/searchStates';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { IconHelp } from '@tabler/icons';
import DefaultInput from '../general/DefaultInput';
import DefaultButton from '../general/DefaultButton';
import DefaultCheckbox from '../general/DefaultCheckbox';
import DefaultSelect from '../general/DefaultSelect';

interface Props {
  extensionList: ExtensionMetadata[];
  hasFilterOptions: boolean;
  handleSearch: (fresh?: boolean) => void;
  handleSearchFilesystem: (searchPaths: string[]) => void;
}

const SearchControlBar: React.FC<Props> = (props: Props) => {
  const [searchExtension, setSearchExtension] = useRecoilState(searchExtensionState);
  const setSearchText = useSetRecoilState(searchTextState);
  const setShowingFilterDrawer = useSetRecoilState(showingFilterDrawerState);
  const [multiSeriesEnabled, setMultiSeriesEnabled] = useState(false);

  const handleSelectDirectory = async () => {
    const fileList = await ipcRenderer.invoke(
      ipcChannels.APP.SHOW_OPEN_DIALOG,
      true,
      [],
      'Select Series Directory',
    );
    if (fileList.length <= 0) return;

    const selectedPath = fileList[0];

    const searchPaths = multiSeriesEnabled
      ? await ipcRenderer.invoke(ipcChannels.FILESYSTEM.LIST_DIRECTORY, selectedPath)
      : [selectedPath];

    props.handleSearchFilesystem(searchPaths);
  };

  const renderFilesystemControls = () => {
    return (
      <Group>
        <DefaultButton oc="blue" onClick={handleSelectDirectory}>
          Select Directory
        </DefaultButton>
        <Tooltip
          position="bottom"
          label={
            <>
              <Text size="sm">When multi-series mode is enabled, each item in the selected</Text>
              <Text size="sm">directory is treated as a separate series.</Text>
            </>
          }
        >
          <Group gap={6} justify="center" align="center">
            <DefaultCheckbox
              label="Multi-series mode"
              checked={multiSeriesEnabled}
              onChange={() => setMultiSeriesEnabled(!multiSeriesEnabled)}
            />
            <IconHelp color={'var(--mantine-color-dark-2)'} size={16} />
          </Group>
        </Tooltip>
      </Group>
    );
  };

  const renderStandardControls = () => {
    return (
      <>
        <DefaultInput
          flexWrapper
          placeholder="Search for a series..."
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') props.handleSearch(true);
          }}
        />
        <DefaultButton oc="blue" onClick={() => props.handleSearch(true)}>
          Search
        </DefaultButton>
        {props.hasFilterOptions ? (
          <DefaultButton onClick={() => setShowingFilterDrawer(true)}>Options</DefaultButton>
        ) : undefined}
      </>
    );
  };

  return (
    <Flex align="left" gap="xs" pt="sm" mb="md" wrap="nowrap">
      <DefaultSelect
        value={searchExtension}
        data={props.extensionList.map((metadata: ExtensionMetadata) => ({
          value: metadata.id,
          label: metadata.name,
        }))}
        onChange={(value) => setSearchExtension(value || searchExtension)}
      />
      {searchExtension === FS_METADATA.id ? renderFilesystemControls() : renderStandardControls()}
    </Flex>
  );
};

export default SearchControlBar;
