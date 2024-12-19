import React, { useEffect, useState } from 'react';
import { ExtensionMetadata, FilterOption, Series, SeriesListResponse } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { useRecoilState, useRecoilValue } from 'recoil';
import AddSeriesModal from './AddSeriesModal';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import ipcChannels from '@/common/constants/ipcChannels.json';
import {
  addModalEditableState,
  addModalSeriesState,
  filterValuesMapState,
  nextSourcePageState,
  searchExtensionState,
  searchTextState,
  searchResultState,
  showingAddModalState,
} from '@/renderer/state/searchStates';
import SearchGrid from './SearchGrid';
import SearchControlBar from './SearchControlBar';
import SearchFilterDrawer from './SearchFilterDrawer';

const Search: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [extensionList, setExtensionList] = useState<ExtensionMetadata[]>([]);
  const searchText = useRecoilValue(searchTextState);
  const [filterValuesMap, setFilterValuesMap] = useRecoilState(filterValuesMapState);
  const [nextSourcePage, setNextSourcePage] = useRecoilState(nextSourcePageState);
  const [searchResult, setSearchResult] = useRecoilState(searchResultState);
  const searchExtension = useRecoilValue(searchExtensionState);
  const [addModalSeries, setAddModalSeries] = useRecoilState(addModalSeriesState);
  const [addModalEditable, setAddModalEditable] = useRecoilState(addModalEditableState);
  const [showingAddModal, setShowingAddModal] = useRecoilState(showingAddModalState);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

  const handleSearch = async (fresh = false) => {
    if (!loading) {
      setLoading(true);

      const page = fresh ? 1 : nextSourcePage;
      const curSeriesList = fresh ? [] : searchResult.seriesList;
      if (fresh) setSearchResult({ seriesList: [], hasMore: false });

      const respPromise =
        searchText.length === 0
          ? ipcRenderer.invoke(
              ipcChannels.EXTENSION.DIRECTORY,
              searchExtension,
              page,
              filterValuesMap[searchExtension] || {},
            )
          : ipcRenderer.invoke(
              ipcChannels.EXTENSION.SEARCH,
              searchExtension,
              searchText,
              page,
              filterValuesMap[searchExtension] || {},
            );

      await respPromise
        .then((resp: SeriesListResponse) => {
          setSearchResult({
            seriesList: curSeriesList.concat(resp.seriesList),
            hasMore: resp.hasMore,
          });
          setNextSourcePage(page + 1);
        })
        .finally(() => setLoading(false))
        .catch((e) => console.error(e));
    }
  };

  const handleSearchFilesystem = async (searchPaths: string[]) => {
    const seriesList: Series[] = [];

    for (const searchPath of searchPaths) {
      const series = await ipcRenderer.invoke(
        ipcChannels.EXTENSION.GET_SERIES,
        FS_METADATA.id,
        searchPath,
      );
      if (series !== null) seriesList.push(series);
    }

    if (seriesList.length > 1) {
      setSearchResult({ seriesList: seriesList, hasMore: false });
    } else if (seriesList.length == 1) {
      setAddModalSeries(seriesList[0]);
      setAddModalEditable(searchExtension === FS_METADATA.id);
      setShowingAddModal(!showingAddModal);
    }
  };

  useEffect(() => {
    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.GET_ALL)
      .then((list: ExtensionMetadata[]) => setExtensionList(list))
      .then(() => ipcRenderer.invoke(ipcChannels.EXTENSION.GET_FILTER_OPTIONS, searchExtension))
      .then((opts: FilterOption[]) => {
        setFilterValuesMap({
          ...filterValuesMap,
          [searchExtension]: {
            ...Object.fromEntries(opts.map((opt) => [opt.id, opt.defaultValue])),
            ...filterValuesMap[searchExtension],
          },
        });
        setFilterOptions(opts);
      })
      .then(() => handleSearch(true))
      .catch((err: Error) => console.error(err));
  }, [searchExtension]);

  if (extensionList.length === 0) return <></>;

  return (
    <>
      <AddSeriesModal
        showing={showingAddModal}
        setShowing={(showing) => {
          setShowingAddModal(showing);
          setAddModalEditable(false);
        }}
        series={addModalSeries}
        editable={addModalEditable}
      />
      <SearchFilterDrawer
        filterOptions={filterOptions}
        onClose={(wasChanged) => {
          if (wasChanged) handleSearch(true);
        }}
      />
      <SearchControlBar
        extensionList={extensionList}
        hasFilterOptions={filterOptions && filterOptions.length > 0}
        handleSearch={handleSearch}
        handleSearchFilesystem={handleSearchFilesystem}
      />

      <SearchGrid loading={loading} handleSearch={handleSearch} />
    </>
  );
};

export default Search;
