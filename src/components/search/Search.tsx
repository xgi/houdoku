import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ExtensionMetadata,
  Series,
  SeriesListResponse,
  SeriesSourceType,
} from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Alert, Button, Center, ScrollArea, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons';
import { openModal } from '@mantine/modals';
import AddSeriesModal from './AddSeriesModal';
import { FS_METADATA } from '../../services/extensions/filesystem';
import ipcChannels from '../../constants/ipcChannels.json';
import { seriesListState } from '../../state/libraryStates';
import {
  addModalEditableState,
  addModalSeriesState,
  curViewingPageState,
  nextSourcePageState,
  searchExtensionState,
  searchParamsState,
  searchResultState,
  showingAddModalState,
} from '../../state/searchStates';
import { libraryColumnsState } from '../../state/settingStates';
import SearchGrid from './SearchGrid';
import SearchControlBar from './SearchControlBar';

export type SearchParams = {
  text?: string;
};

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Search: React.FC<Props> = (_props: Props) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [extensionList, setExtensionList] = useState<ExtensionMetadata[]>([]);
  const [searchParams, setSearchParams] = useRecoilState(searchParamsState);
  const [curViewingPage, setCurViewingPage] = useRecoilState(curViewingPageState);
  const [nextSourcePage, setNextSourcePage] = useRecoilState(nextSourcePageState);
  const [searchResult, setSearchResult] = useRecoilState(searchResultState);
  const seriesList = useRecoilValue(seriesListState);
  const libraryColumns = useRecoilValue(libraryColumnsState);
  const searchExtension = useRecoilValue(searchExtensionState);
  const [addModalSeries, setAddModalSeries] = useRecoilState(addModalSeriesState);
  const [addModalEditable, setAddModalEditable] = useRecoilState(addModalEditableState);
  const [showingAddModal, setShowingAddModal] = useRecoilState(showingAddModalState);

  const getPageSize = (columns: number) => {
    return (
      {
        2: 4,
        4: 8,
        6: 24,
        8: 40,
      }[columns] || 8
    );
  };

  const inLibrary = (series: Series): boolean => {
    return (
      seriesList.find(
        (_series: Series) =>
          (series.extensionId === _series.extensionId && series.sourceId === _series.sourceId) ||
          series.title === _series.title
      ) !== undefined
    );
  };

  const handleSearch = async (params: SearchParams, page = 1, loadingMore = false) => {
    setLoading(true);
    if (!loadingMore) {
      setSearchResult({ seriesList: [], hasMore: false });
      setCurViewingPage(1);
    }

    const respPromise =
      !params.text || params.text.length === 0
        ? ipcRenderer.invoke(ipcChannels.EXTENSION.DIRECTORY, searchExtension, page)
        : ipcRenderer.invoke(ipcChannels.EXTENSION.SEARCH, searchExtension, params.text, page);

    await respPromise
      .then((resp: SeriesListResponse) => {
        setSearchResult({
          // eslint-disable-next-line promise/always-return
          seriesList: loadingMore
            ? searchResult.seriesList.concat(resp.seriesList)
            : resp.seriesList,
          hasMore: resp.hasMore,
        });
        setNextSourcePage(page + 1);
      })
      .finally(() => setLoading(false))
      .catch((e) => log.error(e));
  };

  const handleSearchFilesystem = (path: string) => {
    ipcRenderer
      .invoke(ipcChannels.EXTENSION.GET_SERIES, FS_METADATA.id, SeriesSourceType.STANDARD, path)
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
      .catch((e) => log.error(e));
  };

  const renderAlert = () => {
    const metadata = extensionList.find((item: ExtensionMetadata) => item.id === searchExtension);
    if (metadata && metadata.notice.length > 0) {
      return (
        <Alert icon={<IconInfoCircle size={16} />} title="Extension information" color="indigo">
          <Text>{metadata.notice}</Text>
          <Text>
            For more information, see here:{' '}
            <a href={metadata.noticeUrl} target="_blank" rel="noreferrer">
              {metadata.noticeUrl}
            </a>
          </Text>
        </Alert>
      );
    }
    return <></>;
  };

  const renderLoadMoreButton = () => {
    if (
      searchResult.hasMore ||
      searchResult.seriesList.length > curViewingPage * getPageSize(libraryColumns)
    ) {
      return (
        <Center my="md">
          <Button
            onClick={() => {
              if (
                searchResult.hasMore &&
                searchResult.seriesList.length < (curViewingPage + 1) * getPageSize(libraryColumns)
              ) {
                handleSearch(searchParams, nextSourcePage, true);
              }
              setCurViewingPage(curViewingPage + 1);
            }}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </Center>
      );
    }
    return <></>;
  };

  useEffect(() => {
    setSearchParams({});
    setSearchResult({ seriesList: [], hasMore: false });
    setNextSourcePage(1);
    setCurViewingPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    ipcRenderer
      .invoke(ipcChannels.EXTENSION_MANAGER.GET_ALL)
      .then((list: ExtensionMetadata[]) => setExtensionList(list))
      .then(() => handleSearch(searchParams))
      .catch((err: Error) => log.error(err));
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
      <SearchControlBar
        extensionList={extensionList}
        handleSearch={handleSearch}
        handleSearchFilesystem={handleSearchFilesystem}
      />
      <ScrollArea style={{ height: 'calc(100vh - 24px - 72px)' }} pr="xl" mr={-16}>
        {!loading && searchResult.seriesList.length === 0 ? renderAlert() : ''}
        <SearchGrid loading={loading} getPageSize={getPageSize} inLibrary={inLibrary} />
        {renderLoadMoreButton()}
      </ScrollArea>
    </>
  );
};

export default Search;
