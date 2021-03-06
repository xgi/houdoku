import React, { useEffect, useState } from 'react';
import { Button, Alert, Input, Dropdown, Menu, Modal } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import Paragraph from 'antd/lib/typography/Paragraph';
import { useLocation } from 'react-router-dom';
import styles from './Search.css';
import { ExtensionMetadata } from '../services/extensions/types';
import {
  getExtensionMetadata,
  getSearchableExtensions,
  search,
} from '../services/extension';
import { ProgressFilter, Series } from '../models/types';
import LibraryGrid from './LibraryGrid';
import {
  setAddModalSeries,
  setSearchExtension,
  setSearchResults,
  toggleShowingAddModal,
} from '../features/search/actions';
import { RootState } from '../store';
import AddSeriesModal from './AddSeriesModal';

const { info } = Modal;

const mapState = (state: RootState) => ({
  searchExtension: state.search.searchExtension,
  searchResults: state.search.searchResults,
  addModalSeries: state.search.addModalSeries,
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
  toggleShowingAddModal: () => dispatch(toggleShowingAddModal()),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  importSeries: (extensionId: number, sourceId: string) => void;
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

  const renderAlert = () => {
    const metadata: ExtensionMetadata = getExtensionMetadata(
      props.searchExtension
    );
    if (metadata.notice.length > 0) {
      return (
        <Alert
          className={styles.alert}
          message={`Notice: ${metadata.notice}`}
          type="warning"
        />
      );
    }
    return <></>;
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
      {Object.values(getSearchableExtensions()).map((extension: any) => {
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
  }, [location]);

  return (
    <>
      <AddSeriesModal
        visible={props.showingAddModal}
        series={props.addModalSeries}
        extensionId={props.searchExtension}
        toggleVisible={props.toggleShowingAddModal}
        importSeries={props.importSeries}
      />
      <div className={styles.searchBar}>
        <Dropdown className={styles.extensionDropdown} overlay={extensionMenu}>
          <Button>
            Extension: {getExtensionName(props.searchExtension)}{' '}
            <DownOutlined />
          </Button>
        </Dropdown>
        <Input
          className={styles.searchField}
          placeholder="Search for a series..."
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
        />
      </div>
      {renderAlert()}
      <LibraryGrid
        columns={4}
        seriesList={props.searchResults}
        filter=""
        filterProgress={ProgressFilter.All}
        filterStatus={null}
        clickFunc={(
          series: Series,
          isInLibrary: boolean | undefined = undefined
        ) => {
          if (isInLibrary) {
            showInLibraryMessage();
          } else {
            props.setAddModalSeries(series);
            props.toggleShowingAddModal();
          }
        }}
        inLibraryFunc={inLibrary}
      />
    </>
  );
};

export default connector(Search);
