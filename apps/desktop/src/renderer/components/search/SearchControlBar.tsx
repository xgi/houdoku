import React, { useState } from 'react';
import { ExtensionMetadata } from '@tiyo/common';
import { useRecoilState, useSetRecoilState } from 'recoil';
const { ipcRenderer } = require('electron');
import {
  searchExtensionState,
  searchTextState,
  showingFilterDrawerState,
} from '@/renderer/state/searchStates';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { Button } from '@houdoku/ui/components/Button';
import { HelpCircle, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@houdoku/ui/components/Select';
import { Checkbox } from '@houdoku/ui/components/Checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@houdoku/ui/components/Tooltip';
import { Input } from '@houdoku/ui/components/Input';
import { Label } from '@houdoku/ui/components/Label';

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
      <div className="flex space-x-4">
        <Button onClick={handleSelectDirectory}>Select Directory</Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex space-x-2 items-center">
                <Checkbox
                  id="checkboxMultiSeriesMode"
                  checked={multiSeriesEnabled}
                  onCheckedChange={() => setMultiSeriesEnabled(!multiSeriesEnabled)}
                />
                <Label
                  htmlFor="checkboxMultiSeriesMode"
                  className="flex text-sm font-medium items-center space-x-2"
                >
                  <span>Multi-series mode</span>
                  <HelpCircle className="w-4 h-4" />
                </Label>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>
                When multi-series mode is enabled, each item in the selected
                <br />
                directory is treated as a separate series.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  const renderStandardControls = () => {
    return (
      <>
        <form
          className="flex flex-1 space-x-2"
          onSubmit={() => {
            props.handleSearch(true);
            return false;
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 w-full"
              placeholder="Search for a series..."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        {props.hasFilterOptions ? (
          <Button variant="secondary" onClick={() => setShowingFilterDrawer(true)}>
            Options
          </Button>
        ) : undefined}
      </>
    );
  };

  return (
    <div className="flex space-x-2 py-3">
      <Select
        defaultValue={searchExtension}
        onValueChange={(value) => setSearchExtension(value || searchExtension)}
      >
        <SelectTrigger className="max-w-52">
          <SelectValue placeholder="Select extension" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {props.extensionList
              .map((metadata: ExtensionMetadata) => ({
                value: metadata.id,
                label: metadata.name,
              }))
              .map((metadata) => (
                <SelectItem key={metadata.value} value={metadata.value}>
                  {metadata.label}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {searchExtension === FS_METADATA.id ? renderFilesystemControls() : renderStandardControls()}
    </div>
  );
};

export default SearchControlBar;
