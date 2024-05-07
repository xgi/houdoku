import React from 'react';
import { ExtensionMetadata } from '@tiyo/common';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { Button, Flex, Select, TextInput } from '@mantine/core';
const { ipcRenderer } = require('electron');
import {
  searchExtensionState,
  searchTextState,
  showingFilterDrawerState,
} from '@/renderer/state/searchStates';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import ipcChannels from '@/common/constants/ipcChannels.json';

interface Props {
  extensionList: ExtensionMetadata[];
  hasFilterOptions: boolean;
  handleSearch: (fresh?: boolean) => void;
  handleSearchFilesystem: (path: string) => void;
}

const SearchControlBar: React.FC<Props> = (props: Props) => {
  const [searchExtension, setSearchExtension] = useRecoilState(searchExtensionState);
  const setSearchText = useSetRecoilState(searchTextState);
  const setShowingFilterDrawer = useSetRecoilState(showingFilterDrawerState);

  const renderSearchControls = () => {
    if (searchExtension === FS_METADATA.id) {
      return (
        <Button
          onClick={() =>
            ipcRenderer
              .invoke(ipcChannels.APP.SHOW_OPEN_DIALOG, true, [], 'Select Series Directory')
              .then((fileList: string) => {
                // eslint-disable-next-line promise/always-return
                if (fileList.length > 0) {
                  props.handleSearchFilesystem(fileList[0]);
                }
              })
          }
        >
          Select Directory
        </Button>
      );
    }

    return (
      <>
        <TextInput
          flex={1}
          placeholder="Search for a series..."
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') props.handleSearch(true);
          }}
        />
        <Button onClick={() => props.handleSearch(true)}>Search</Button>
        {props.hasFilterOptions ? (
          <Button variant="default" onClick={() => setShowingFilterDrawer(true)}>
            Options
          </Button>
        ) : undefined}
      </>
    );
  };

  return (
    <Flex align="left" gap="xs" pt="sm" mb="md" wrap="nowrap">
      <Select
        value={searchExtension}
        data={props.extensionList.map((metadata: ExtensionMetadata) => ({
          value: metadata.id,
          label: metadata.name,
        }))}
        onChange={(value) => setSearchExtension(value || searchExtension)}
      />
      {renderSearchControls()}
    </Flex>
  );
};

export default SearchControlBar;
