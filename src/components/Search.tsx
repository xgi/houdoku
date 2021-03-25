import React, { useEffect, useState } from 'react';
import { Button, Alert, Input, Dropdown, Menu, Modal, Col, Row } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import Paragraph from 'antd/lib/typography/Paragraph';
import { useLocation } from 'react-router-dom';
import styles from './Search.css';
import { ExtensionMetadata } from '../services/extensions/types';
import {
  EXTENSIONS,
  getExtensionMetadata,
  getSeries,
  search,
} from '../services/extension';
import { ProgressFilter, Series, SeriesSourceType } from '../models/types';
import LibraryGrid from './LibraryGrid';
import {
  setAddModalSeries,
  setSearchExtension,
  setSearchResults,
  toggleShowingAddModal,
} from '../features/search/actions';
import { RootState } from '../store';
import AddSeriesModal from './AddSeriesModal';
import Uploader from './Uploader';
import filesystem from '../services/extensions/filesystem';

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

  const getExtensionName = (extensionId: number) => {
    const metadata: ExtensionMetadata = getExtensionMetadata(extensionId);
    return metadata.name;
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

  const handleSearch = async () => {
    const seriesList: Series[] = await search(
      props.searchExtension,
      searchText
    );

    props.setSearchResults(seriesList);
  };

  const handleSearchFilesystem = (
    path: string,
    sourceType: SeriesSourceType
  ) => {
    return getSeries(
      filesystem.METADATA.id,
      sourceType,
      path
    ).then((series: Series) => props.setSearchResults([series]));
  };

  const renderAlert = () => {
    const metadata: ExtensionMetadata = getExtensionMetadata(
      props.searchExtension
    );
    if (metadata.notice.length > 0) {
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

  const showInLibraryMessage = () => {
    info({
      content: <Paragraph>This series is already in your library.</Paragraph>,
    });
  };

  const extensionMenu = (
    <Menu
      onClick={(e) =>
        props.setSearchExtension(parseInt(e.item.props['data-value'], 10))
      }
    >
      {Object.values(EXTENSIONS).map((extension: any) => {
        const { id } = extension.METADATA;
        return (
          <Menu.Item key={id} data-value={id}>
            {getExtensionName(id)}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  useEffect(() => {
    props.setSearchResults([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

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
        <Dropdown className={styles.extensionDropdown} overlay={extensionMenu}>
          <Button>
            Extension: {getExtensionName(props.searchExtension)}{' '}
            <DownOutlined />
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
