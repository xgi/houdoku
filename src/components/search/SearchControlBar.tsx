/* eslint-disable react/jsx-boolean-value */
import React from 'react';
import { ExtensionMetadata } from 'houdoku-extension-lib';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { Button, Group, Input, Select } from '@mantine/core';
import { ipcRenderer } from 'electron';
import {
  searchExtensionState,
  searchTextState,
  showingFilterDrawerState,
} from '../../state/searchStates';
import { FS_METADATA } from '../../services/extensions/filesystem';
import ipcChannels from '../../constants/ipcChannels.json';

interface Props {
  extensionList: ExtensionMetadata[];
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
        <Input
          style={{ width: '100%' }}
          placeholder="Search for a series..."
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') props.handleSearch(true);
          }}
        />
        <Button onClick={() => props.handleSearch(true)}>Search</Button>
        <Button variant="default" onClick={() => setShowingFilterDrawer(true)}>
          Options
        </Button>
      </>
    );
  };

  return (
    <Group position="left" align="left" spacing="xs" mb="md" noWrap>
      <Select
        value={searchExtension}
        data={props.extensionList.map((metadata: ExtensionMetadata) => ({
          value: metadata.id,
          label: metadata.name,
        }))}
        onChange={(value: string) => setSearchExtension(value)}
      />
      {renderSearchControls()}
    </Group>
  );
};

export default SearchControlBar;
