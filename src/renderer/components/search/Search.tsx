import React, { useEffect, useState } from 'react';
import { ExtensionMetadata, FilterOption, Series, SeriesListResponse } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { useRecoilState, useRecoilValue } from 'recoil';
import { Text } from '@mantine/core';
import { openModal } from '@mantine/modals';
import AddSeriesModal from './AddSeriesModal';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { activeSeriesListState } from '@/renderer/state/libraryStates';
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

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Search: React.FC<Props> = (_props: Props) => {
  const [loading, setLoading] = useState(false);
  const [extensionList, setExtensionList] = useState<ExtensionMetadata[]>([]);
  const searchText = useRecoilValue(searchTextState);
  const [filterValuesMap, setFilterValuesMap] = useRecoilState(filterValuesMapState);
  const [nextSourcePage, setNextSourcePage] = useRecoilState(nextSourcePageState);
  const [searchResult, setSearchResult] = useRecoilState(searchResultState);
  const activeSeriesList = useRecoilValue(activeSeriesListState);
  const searchExtension = useRecoilValue(searchExtensionState);
  const [addModalSeries, setAddModalSeries] = useRecoilState(addModalSeriesState);
  const [addModalEditable, setAddModalEditable] = useRecoilState(addModalEditableState);
  const [showingAddModal, setShowingAddModal] = useRecoilState(showingAddModalState);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

  const inLibrary = (series: Series): boolean => {
    return (
      activeSeriesList.find(
        (_series: Series) =>
          (series.extensionId === _series.extensionId && series.sourceId === _series.sourceId) ||
          series.title === _series.title,
      ) !== undefined
    );
  };

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

  const handleSearchFilesystem = (path: string) => {
    ipcRenderer
      .invoke(ipcChannels.EXTENSION.GET_SERIES, FS_METADATA.id, path)
      .then((series: Series) => {
        // eslint-disable-next-line promise/always-return
        if (inLibrary(series)) {
          openModal({
            title: 'Already in library',
            children: (
              <Text size="sm" mb="sm">
                The series{' '}
                <Text color="teal" inherit component="span" italic>
                  {series.title}
                </Text>{' '}
                is already in your library.
              </Text>
            ),
          });
        } else {
          setAddModalSeries(series);
          setAddModalEditable(searchExtension === FS_METADATA.id);
          setShowingAddModal(!showingAddModal);
        }
      })
      .catch((e) => console.error(e));
  };

  // const renderAlert = () => {
  //   const metadata = extensionList.find((item: ExtensionMetadata) => item.id === searchExtension);
  //   if (metadata && metadata.notice.length > 0) {
  //     return (
  //       <Alert icon={<IconInfoCircle size={16} />} title="Extension information" color="indigo">
  //         <Text>{metadata.notice}</Text>
  //         {metadata.noticeUrl ? (
  //           <Text>
  //             For more information, see here:{' '}
  //             <Text
  //               variant="link"
  //               component="a"
  //               href={metadata.noticeUrl}
  //               target="_blank"
  //               rel="noreferrer"
  //             >
  //               {metadata.noticeUrl}
  //             </Text>
  //           </Text>
  //         ) : (
  //           ''
  //         )}
  //       </Alert>
  //     );
  //   }
  //   return <></>;
  // };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchExtension]);

  if (extensionList.length === 0) return <></>;

  return (
    <>
      <AddSeriesModal
        visible={showingAddModal}
        series={addModalSeries}
        editable={addModalEditable}
        close={() => {
          setShowingAddModal(false);
          setAddModalEditable(false);
        }}
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

      {/* {!loading && searchResult.seriesList.length === 0 ? renderAlert() : ''} */}
      <SearchGrid loading={loading} inLibrary={inLibrary} handleSearch={handleSearch} />
    </>
  );
};

export default Search;
