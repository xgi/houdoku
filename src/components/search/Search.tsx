import React, { useEffect, useState } from 'react';
import {
  Button,
  Alert,
  Input,
  Dropdown,
  Menu,
  Modal,
  Typography,
  Spin,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
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
import styles from './Search.css';
import { ProgressFilter } from '../../models/types';
import SeriesGrid from '../general/SeriesGrid';
import { RootState } from '../../store';
import AddSeriesModal from './AddSeriesModal';
import { FS_METADATA } from '../../services/extensions/filesystem';
import ipcChannels from '../../constants/ipcChannels.json';
import { seriesListState } from '../../state/libraryStates';
import {
  addModalEditableState,
  addModalSeriesState,
  searchExtensionState,
  searchResultsState,
  showingAddModalState,
} from '../../state/searchStates';

type SearchParams = {
  text?: string;
};

const RESULTS_PAGE_SIZE = 8;

const { Text, Paragraph } = Typography;
const { info } = Modal;

const mapState = (state: RootState) => ({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const Search: React.FC<Props> = (props: Props) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [extensionList, setExtensionList] = useState<ExtensionMetadata[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [curViewingPage, setCurViewingPage] = useState(1);
  const [nextSourcePage, setNextSourcePage] = useState(1);
  const [sourceHasMore, setSourceHasMore] = useState(false);
  const seriesList = useRecoilValue(seriesListState);
  const [searchExtension, setSearchExtension] =
    useRecoilState(searchExtensionState);
  const [searchResults, setSearchResults] = useRecoilState(searchResultsState);
  const [addModalSeries, setAddModalSeries] =
    useRecoilState(addModalSeriesState);
  const [addModalEditable, setAddModalEditable] = useRecoilState(
    addModalEditableState
  );
  const [showingAddModal, setShowingAddModal] =
    useRecoilState(showingAddModalState);

  const getSearchExtensionMetadata = () => {
    return extensionList.find(
      (metadata: ExtensionMetadata) => metadata.id === searchExtension
    );
  };

  const inLibrary = (series: Series): boolean => {
    return (
      seriesList.find(
        (_series: Series) =>
          (series.extensionId === _series.extensionId &&
            series.sourceId === _series.sourceId) ||
          series.title === _series.title
      ) !== undefined
    );
  };

  const showInLibraryMessage = (series: Series) => {
    info({
      content: (
        <>
          <Paragraph>
            &quot;{series.title}&quot; is already in your library.
          </Paragraph>

          <Paragraph>
            <Text type="secondary">Source ID:</Text>{' '}
            <Text type="secondary" code>
              {series.sourceId}
            </Text>
            <br />
            <Text type="secondary">Extension:</Text>{' '}
            <Text type="secondary" code>
              {series.extensionId}
            </Text>
          </Paragraph>
        </>
      ),
    });
  };

  const handleSearch = async (
    params: SearchParams,
    page = 1,
    loadingMore = false
  ) => {
    setLoading(true);
    if (!loadingMore) {
      setSearchResults([]);
      setCurViewingPage(1);
    }

    const respPromise =
      !params.text || params.text.length === 0
        ? ipcRenderer.invoke(
            ipcChannels.EXTENSION.DIRECTORY,
            searchExtension,
            page
          )
        : ipcRenderer.invoke(
            ipcChannels.EXTENSION.SEARCH,
            searchExtension,
            params.text,
            page
          );

    await respPromise
      .then((resp: SeriesListResponse) => {
        setSearchResults(
          // eslint-disable-next-line promise/always-return
          loadingMore ? searchResults.concat(resp.seriesList) : resp.seriesList
        );
        setSourceHasMore(resp.hasMore);
        setNextSourcePage(page + 1);
      })
      .finally(() => setLoading(false))
      .catch((e) => log.error(e));
  };

  const handleSearchFilesystem = (
    path: string,
    sourceType: SeriesSourceType
  ) => {
    ipcRenderer
      .invoke(
        ipcChannels.EXTENSION.GET_SERIES,
        FS_METADATA.id,
        sourceType,
        path
      )
      .then((series: Series) => {
        // eslint-disable-next-line promise/always-return
        if (inLibrary(series)) {
          showInLibraryMessage(series);
        } else {
          setAddModalSeries(series);
          setAddModalEditable(searchExtension === FS_METADATA.id);
          setShowingAddModal(!showingAddModal);
        }
      })
      .catch((e) => log.error(e));
  };

  const renderAlert = () => {
    const metadata = getSearchExtensionMetadata();
    if (metadata && metadata.notice.length > 0) {
      return (
        <Alert
          className={styles.alert}
          message={`Notice: ${metadata.notice}`}
          description={
            metadata.noticeUrl.length > 0 ? (
              <Paragraph>
                For more information, see here:{' '}
                <a href={metadata.noticeUrl} target="_blank" rel="noreferrer">
                  {metadata.noticeUrl}
                </a>
              </Paragraph>
            ) : (
              ''
            )
          }
          type="warning"
        />
      );
    }
    return <></>;
  };

  const renderFilesystemInputs = () => {
    return (
      <div className={styles.fsInputContainer}>
        <Button
          onClick={() =>
            ipcRenderer
              .invoke(
                ipcChannels.APP.SHOW_OPEN_DIALOG,
                true,
                [],
                'Select Series Directory'
              )
              .then((fileList: string) => {
                // eslint-disable-next-line promise/always-return
                if (fileList.length > 0) {
                  handleSearchFilesystem(
                    fileList[0],
                    SeriesSourceType.STANDARD
                  );
                }
              })
          }
        >
          Select Directory
        </Button>
      </div>
    );
  };

  const renderExtensionMenu = () => {
    return (
      <Menu
        onClick={(e: any) => {
          setSearchResults([]);
          setNextSourcePage(1);
          setSearchParams({});
          setSearchExtension(e.item.props['data-value']);
        }}
      >
        {extensionList.map((metadata: ExtensionMetadata) => (
          <Menu.Item key={metadata.id} data-value={metadata.id}>
            {metadata.name}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const renderSeriesGrid = () => {
    return (
      <div className={styles.seriesGrid}>
        <SeriesGrid
          columns={4}
          seriesList={searchResults.slice(
            0,
            curViewingPage * RESULTS_PAGE_SIZE
          )}
          filter=""
          filterProgress={ProgressFilter.All}
          filterStatus={null}
          clickFunc={(
            series: Series,
            isInLibrary: boolean | undefined = undefined
          ) => {
            if (isInLibrary) {
              showInLibraryMessage(series);
            } else {
              setAddModalSeries(series);
              setAddModalEditable(searchExtension === FS_METADATA.id);
              setShowingAddModal(!showingAddModal);
            }
          }}
          inLibraryFunc={inLibrary}
        />
      </div>
    );
  };

  const getExtensionList = async () => {
    setExtensionList(
      await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.GET_ALL)
    );
  };

  useEffect(() => {
    setSearchResults([]);
    setSourceHasMore(false);
    setNextSourcePage(1);
    setCurViewingPage(1);
    setSearchParams({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    getExtensionList()
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
        toggleVisible={() => {
          setShowingAddModal(!showingAddModal);
          setAddModalEditable(false);
        }}
      />
      <div>
        <div className={styles.searchBar}>
          <Dropdown
            className={styles.extensionDropdown}
            overlay={renderExtensionMenu()}
          >
            <Button>
              Extension: {getSearchExtensionMetadata()?.name} <DownOutlined />
            </Button>
          </Dropdown>
          {searchExtension !== FS_METADATA.id ? (
            <>
              <Input
                className={styles.searchField}
                placeholder="Search for a series..."
                allowClear
                value={searchParams.text}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, text: e.target.value })
                }
                onPressEnter={() => handleSearch(searchParams)}
              />
              <Button onClick={() => handleSearch(searchParams)}>Search</Button>
            </>
          ) : (
            <div className={styles.searchField} />
          )}
        </div>
        {renderAlert()}
        {searchExtension === FS_METADATA.id ? renderFilesystemInputs() : <></>}
      </div>

      {searchExtension === FS_METADATA.id ? (
        <></>
      ) : (
        <>
          {searchResults.length === 0 ? (
            <div className={styles.loadingContainer}>
              {loading ? (
                <>
                  <Spin />
                  <Paragraph>Searching from extension...</Paragraph>
                </>
              ) : (
                <Paragraph>
                  Sorry, no series were found with the current settings.
                </Paragraph>
              )}
            </div>
          ) : (
            <>
              {renderSeriesGrid()}
              <div className={styles.footerContainer}>
                {sourceHasMore ||
                searchResults.length > curViewingPage * RESULTS_PAGE_SIZE ? (
                  <Button
                    className={styles.loadMoreButton}
                    onClick={() => {
                      if (
                        sourceHasMore &&
                        searchResults.length <
                          (curViewingPage + 1) * RESULTS_PAGE_SIZE
                      ) {
                        handleSearch(searchParams, nextSourcePage, true);
                      }
                      setCurViewingPage(curViewingPage + 1);
                    }}
                  >
                    Load More
                  </Button>
                ) : (
                  <></>
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default connector(Search);
