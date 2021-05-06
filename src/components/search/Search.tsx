import React, { useEffect, useState } from 'react';
import { Button, Alert, Input, Dropdown, Menu, Modal, Col, Row } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import Paragraph from 'antd/lib/typography/Paragraph';
import { useLocation } from 'react-router-dom';
import { ExtensionMetadata } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import styles from './Search.css';
import { ProgressFilter, Series, SeriesSourceType } from '../../models/types';
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
import filesystem from '../../services/extensions/filesystem';

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
  setSearchExtension: (searchExtension: number) =>
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
  const [searchText, setSearchText] = useState('');
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

  const handleSearch = () => {
    ipcRenderer
      .invoke('extension-search', props.searchExtension, searchText)
      .then((seriesList: Series[]) => props.setSearchResults(seriesList))
      .catch((e) => console.error(e));
  };

  const handleSearchFilesystem = (
    path: string,
    sourceType: SeriesSourceType
  ) => {
    ipcRenderer
      .invoke('extension-getSeries', 1, sourceType, path)
      .then((series: Series) => props.setSearchResults([series]))
      .catch((e) => console.error(e));
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
            onChange={(e) =>
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
        onClick={(e) => {
          props.setSearchResults([]);
          props.setSearchExtension(parseInt(e.item.props['data-value'], 10));
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
    setExtensionList(await ipcRenderer.invoke('extension-manager-get-all'));
  };

  useEffect(() => {
    props.setSearchResults([]);
    getExtensionList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

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
        {props.searchExtension !== filesystem.METADATA.id ? (
          <Input
            className={styles.searchField}
            placeholder="Search for a series..."
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
          />
        ) : (
          <div className={styles.searchField} />
        )}
      </div>
      {renderAlert()}
      {props.searchExtension === filesystem.METADATA.id ? (
        renderFilesystemInputs()
      ) : (
        <></>
      )}
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
              props.searchExtension === filesystem.METADATA.id
            );
          }
        }}
        inLibraryFunc={inLibrary}
      />
    </>
  );
};

export default connector(Search);
