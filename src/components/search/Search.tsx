import React, { useEffect, useState } from 'react';
import {
  Button,
  Alert,
  Input,
  Dropdown,
  Menu,
  Modal,
  Col,
  Row,
  Spin,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import Paragraph from 'antd/lib/typography/Paragraph';
import { useLocation } from 'react-router-dom';
import {
  ExtensionMetadata,
  Series,
  SeriesSourceType,
} from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import styles from './Search.css';
import { ProgressFilter } from '../../models/types';
import LibraryGrid from '../library/LibraryGrid';
import {
  setAddModalSeries,
  setSearchExtension,
  setSearchResults,
  toggleShowingAddModal,
} from '../../features/search/actions';
import { RootState } from '../../store';
import AddSeriesModal from './AddSeriesModal';
import Uploader from './Uploader';
import { FS_METADATA } from '../../services/extensions/filesystem';
import ipcChannels from '../../constants/ipcChannels.json';

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

  const handleSearch = (text?: string) => {
    setLoading(true);
    props.setSearchResults([]);

    if (!text || text.length === 0) {
      ipcRenderer
        .invoke(ipcChannels.EXTENSION.DIRECTORY, props.searchExtension)
        .then((seriesList: Series[]) => props.setSearchResults(seriesList))
        .finally(() => setLoading(false))
        .catch((e) => log.error(e));
    } else {
      ipcRenderer
        .invoke(ipcChannels.EXTENSION.SEARCH, props.searchExtension, text)
        .then((seriesList: Series[]) => props.setSearchResults(seriesList))
        .finally(() => setLoading(false))
        .catch((e) => log.error(e));
    }
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
      .then((series: Series) => props.setSearchResults([series]))
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
      <Row>
        <Col span={12}>
          <Paragraph>Upload Directory</Paragraph>
          <Uploader
            className={styles.uploader}
            callback={(path: string) =>
              handleSearchFilesystem(path, SeriesSourceType.STANDARD)
            }
          />
        </Col>
        <Col span={12}>
          <Paragraph>Upload Archive</Paragraph>
          <input
            type="file"
            onChange={(e: any) =>
              handleSearchFilesystem(
                e.target.files[0].path,
                SeriesSourceType.ARCHIVE
              )
            }
          />
        </Col>
      </Row>
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

  const showInLibraryMessage = () => {
    info({
      content: <Paragraph>This series is already in your library.</Paragraph>,
    });
  };

  const getExtensionList = async () => {
    setExtensionList(
      await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.GET_ALL)
    );
  };

  useEffect(() => {
    props.setSearchResults([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    // eslint-disable-next-line promise/catch-or-return
    getExtensionList().then(() => handleSearch());
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
          <Input.Search
            className={styles.searchField}
            placeholder="Search for a series..."
            allowClear
            onSearch={(text: string) => handleSearch(text)}
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
      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin />
          <Paragraph>Loading results...</Paragraph>
        </div>
      ) : (
        <LibraryGrid
          columns={4}
          seriesList={props.searchResults}
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
              showInLibraryMessage();
            } else {
              props.setAddModalSeries(series);
              props.toggleShowingAddModal(
                props.searchExtension === FS_METADATA.id
              );
            }
          }}
          inLibraryFunc={inLibrary}
        />
      )}
    </>
  );
};

export default connector(Search);
