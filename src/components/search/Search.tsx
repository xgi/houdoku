import React, { useEffect, useState } from 'react';
import {
  Button,
  Alert,
  Input,
  Dropdown,
  Menu,
  Modal,
  Divider,
  Typography,
  Pagination,
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
import styles from './Search.css';
import { ProgressFilter } from '../../models/types';
import SeriesGrid from '../general/SeriesGrid';
import {
  setAddModalSeries,
  setSearchExtension,
  setSearchResults,
  toggleShowingAddModal,
} from '../../features/search/actions';
import { RootState } from '../../store';
import AddSeriesModal from './AddSeriesModal';
import { FS_METADATA } from '../../services/extensions/filesystem';
import ipcChannels from '../../constants/ipcChannels.json';

type SearchParams = {
  text?: string;
};

const RESULTS_PAGE_SIZE = 8;

const { Text, Paragraph } = Typography;
const { info } = Modal;

const mapState = (state: RootState) => ({
  searchExtension: state.search.searchExtension,
  searchResults: state.search.searchResults,
  addModalSeries: state.search.addModalSeries,
  addModalEditable: state.search.addModalEditable,
  showingAddModal: state.search.showingAddModal,
  seriesList: state.library.seriesList,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setSearchExtension: (searchExtension: string) =>
    dispatch(setSearchExtension(searchExtension)),
  setSearchResults: (searchResults: Series[]) =>
    dispatch(setSearchResults(searchResults)),
  setAddModalSeries: (addModalSeries: Series) =>
    dispatch(setAddModalSeries(addModalSeries)),
  toggleShowingAddModal: (editable: boolean) =>
    dispatch(toggleShowingAddModal(editable)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  importSeries: (series: Series) => void;
};

const Search: React.FC<Props> = (props: Props) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [extensionList, setExtensionList] = useState<ExtensionMetadata[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [curViewingPage, setCurViewingPage] = useState(1);

  const getSearchExtensionMetadata = () => {
    return extensionList.find(
      (metadata: ExtensionMetadata) => metadata.id === props.searchExtension
    );
  };

  const inLibrary = (series: Series): boolean => {
    return (
      props.seriesList.find(
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
    pageOffset = 0,
    changingPage = false
  ) => {
    setLoading(true);
    if (!changingPage) {
      props.setSearchResults([]);
      setCurViewingPage(1);
    }

    const respPromise =
      !params.text || params.text.length === 0
        ? ipcRenderer.invoke(
            ipcChannels.EXTENSION.DIRECTORY,
            props.searchExtension,
            pageOffset,
            RESULTS_PAGE_SIZE
          )
        : ipcRenderer.invoke(
            ipcChannels.EXTENSION.SEARCH,
            props.searchExtension,
            params.text,
            pageOffset,
            RESULTS_PAGE_SIZE
          );

    await respPromise
      .then((resp: SeriesListResponse) => {
        const adjustedSearchResults = changingPage
          ? [...props.searchResults]
          : [];

        // eslint-disable-next-line promise/always-return
        for (let i = 0; i < resp.seriesList.length; i += 1) {
          adjustedSearchResults[RESULTS_PAGE_SIZE * pageOffset + i] =
            resp.seriesList[i];
        }

        props.setSearchResults(adjustedSearchResults);
        setTotalResults(resp.total);
        setHasMore(resp.hasMore);
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
          props.setAddModalSeries(series);
          props.toggleShowingAddModal(props.searchExtension === FS_METADATA.id);
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
        <Divider>or</Divider>
        <Button
          onClick={() =>
            ipcRenderer
              .invoke(
                ipcChannels.APP.SHOW_OPEN_DIALOG,
                false,
                [
                  {
                    name: 'Archives',
                    extensions: ['zip', 'rar', 'cbz', 'cbr'],
                  },
                ],
                'Select Series Archive'
              )
              .then((fileList: string) => {
                // eslint-disable-next-line promise/always-return
                if (fileList.length > 0) {
                  handleSearchFilesystem(fileList[0], SeriesSourceType.ARCHIVE);
                }
              })
          }
        >
          Select Archive File
        </Button>
      </div>
    );
  };

  const renderExtensionMenu = () => {
    return (
      <Menu
        onClick={(e: any) => {
          props.setSearchResults([]);
          props.setSearchExtension(e.item.props['data-value']);
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
    const startIndex = (curViewingPage - 1) * RESULTS_PAGE_SIZE;
    return (
      <div className={styles.seriesGrid}>
        <SeriesGrid
          columns={4}
          seriesList={props.searchResults.slice(
            startIndex,
            startIndex + RESULTS_PAGE_SIZE
          )}
          sorted={false}
          filter=""
          filterProgress={ProgressFilter.All}
          filterStatus={null}
          filterUserTags={[]}
          clickFunc={(
            series: Series,
            isInLibrary: boolean | undefined = undefined
          ) => {
            if (isInLibrary) {
              showInLibraryMessage(series);
            } else {
              props.setAddModalSeries(series);
              props.toggleShowingAddModal(
                props.searchExtension === FS_METADATA.id
              );
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
    props.setSearchResults([]);
    setTotalResults(0);
    setHasMore(false);
    setCurViewingPage(1);
    setSearchParams({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    getExtensionList()
      .then(() => handleSearch(searchParams))
      .catch((err: Error) => log.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.searchExtension]);

  if (extensionList.length === 0) return <></>;

  return (
    <>
      <AddSeriesModal
        visible={props.showingAddModal}
        series={props.addModalSeries}
        editable={props.addModalEditable}
        toggleVisible={() => props.toggleShowingAddModal(false)}
        importSeries={props.importSeries}
      />
      <div className={styles.container}>
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
            {props.searchExtension !== FS_METADATA.id ? (
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
            ) : (
              <div className={styles.searchField} />
            )}
          </div>
          {renderAlert()}
          {props.searchExtension === FS_METADATA.id ? (
            renderFilesystemInputs()
          ) : (
            <></>
          )}
        </div>

        {props.searchExtension === FS_METADATA.id ? (
          <></>
        ) : (
          <>
            {props.searchResults.length === 0 ? (
              <>
                {loading ? (
                  <div className={styles.loadingText}>
                    <Spin />
                    <Paragraph>Searching from extension...</Paragraph>
                  </div>
                ) : (
                  <Paragraph className={styles.loadingText}>
                    Sorry, no series were found with the current settings.
                  </Paragraph>
                )}
                <div />
              </>
            ) : (
              <>
                {renderSeriesGrid()}
                <div className={styles.paginationContainer}>
                  <Pagination
                    total={totalResults}
                    pageSize={RESULTS_PAGE_SIZE}
                    showTotal={(total) => (
                      <Paragraph>{total} results</Paragraph>
                    )}
                    showSizeChanger={false}
                    current={curViewingPage}
                    onChange={(page) => {
                      if (
                        hasMore ||
                        page !== Math.ceil(totalResults / RESULTS_PAGE_SIZE)
                      ) {
                        const startIndex = RESULTS_PAGE_SIZE * (page - 1);
                        const indexArr = Array.from(
                          {
                            length: RESULTS_PAGE_SIZE,
                          },
                          (_v, k) => k + startIndex
                        );
                        if (
                          indexArr.some(
                            (idx) => props.searchResults[idx] === undefined
                          )
                        ) {
                          handleSearch(searchParams, page - 1, true);
                        }
                      }
                      setCurViewingPage(page);
                    }}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default connector(Search);
