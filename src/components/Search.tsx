import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button, Alert, Input, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import styles from './Search.css';
import routes from '../constants/routes.json';
import { ExtensionMetadata } from '../services/extensions/types';
import {
  getExtensionMetadata,
  getSearchableExtensions,
  search,
} from '../services/extension';
import { Series } from '../models/types';
import LibraryGrid from './LibraryGrid';
import {
  setAddModalSeries,
  setSearchExtension,
  setSearchResults,
  toggleShowingAddModal,
} from '../features/search/actions';
import { RootState } from '../store';
import AddSeriesModal from './AddSeriesModal';

const { Title, Text } = Typography;

const mapState = (state: RootState) => ({
  searchExtension: state.search.searchExtension,
  searchResults: state.search.searchResults,
  addModalSeries: state.search.addModalSeries,
  showingAddModal: state.search.showingAddModal,
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

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const Search: React.FC<Props> = (props: Props) => {
  const [searchText, setSearchText] = useState('');

  const getExtensionName = (extensionId: number) => {
    const metadata: ExtensionMetadata = getExtensionMetadata(extensionId);
    return metadata.name;
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

  return (
    <>
      <AddSeriesModal
        visible={props.showingAddModal}
        series={props.addModalSeries}
        toggleVisible={props.toggleShowingAddModal}
      />
      <Button onClick={props.toggleShowingAddModal}>show modal</Button>
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
        clickFunc={(series: Series) => {
          props.setAddModalSeries(series);
          props.toggleShowingAddModal();
        }}
      />
    </>
  );
};

export default connector(Search);
