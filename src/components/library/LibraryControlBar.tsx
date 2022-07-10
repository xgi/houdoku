/* eslint-disable react/jsx-boolean-value */
import React, { useState } from 'react';
import { Button, Input, Dropdown, Menu } from 'antd';
import { DownOutlined, SyncOutlined } from '@ant-design/icons';
import { Header } from 'antd/lib/layout/layout';
import { connect, ConnectedProps } from 'react-redux';
import { Series, SeriesStatus } from 'houdoku-extension-lib';
import styles from './LibraryControlBar.css';
import { setFilter } from '../../features/library/actions';
import { loadSeriesList, reloadSeriesList } from '../../features/library/utils';
import { setStatusText } from '../../features/statusbar/actions';
import { RootState } from '../../store';
import { LibrarySort, LibraryView, ProgressFilter } from '../../models/types';
import {
  setLibraryColumns,
  setLibraryViews,
  setLibraryFilterProgress,
  setLibraryFilterStatus,
  setLibrarySort,
} from '../../features/settings/actions';

const mapState = (state: RootState) => ({
  seriesList: state.library.seriesList,
  reloadingSeriesList: state.library.reloadingSeriesList,
  filter: state.library.filter,
  libraryFilterStatus: state.settings.libraryFilterStatus,
  libraryFilterProgress: state.settings.libraryFilterProgress,
  libraryColumns: state.settings.libraryColumns,
  libraryViews: state.settings.libraryViews,
  librarySort: state.settings.librarySort,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
  loadSeriesList: () => loadSeriesList(dispatch),
  reloadSeriesList: (seriesList: Series[], callback?: () => void) =>
    reloadSeriesList(dispatch, seriesList, callback),
  setFilter: (filter: string) => dispatch(setFilter(filter)),
  setLibraryFilterStatus: (status: SeriesStatus | null) =>
    dispatch(setLibraryFilterStatus(status)),
  setLibraryFilterProgress: (progressFilter: ProgressFilter) =>
    dispatch(setLibraryFilterProgress(progressFilter)),
  setLibraryColumns: (libraryColumns: number) =>
    dispatch(setLibraryColumns(libraryColumns)),
  setLibraryViews: (libraryViews: LibraryView) =>
    dispatch(setLibraryViews(libraryViews)),
  setLibrarySort: (librarySort: LibrarySort) =>
    dispatch(setLibrarySort(librarySort)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const LIBRARY_SORT_TEXT = {
  [LibrarySort.TitleAsc]: 'Title Asc',
  [LibrarySort.TitleDesc]: 'Title Desc',
  [LibrarySort.UnreadAsc]: 'Unread Asc',
  [LibrarySort.UnreadDesc]: 'Unread Desc',
};

const LibraryControlBar: React.FC<Props> = (props: Props) => {
  const [viewSubmenu, setViewSubmenu] = useState('');
  const [filterSubmenu, setFilterSubmenu] = useState('');

  return (
    <>
      <Header className={styles.header}>
        <Button
          className={styles.reloadButton}
          type="primary"
          onClick={() => {
            if (!props.reloadingSeriesList) {
              props.reloadSeriesList(props.seriesList, props.loadSeriesList);
            }
          }}
        >
          {props.reloadingSeriesList ? <SyncOutlined spin /> : 'Refresh'}
        </Button>
        <Dropdown
          className={styles.libraryViewDropdown}
          overlay={
            <Menu
              openKeys={[viewSubmenu]}
              onOpenChange={(keys) => setViewSubmenu(keys.pop() || '')}
            >
              <Menu.SubMenu
                key={'Columns'}
                title={'Columns'}
                popupOffset={[-4, 0]}
              >
                {[2, 4, 6, 8].map((value) => (
                  <Menu.Item
                    key={`columns-${value}`}
                    onClick={() => props.setLibraryColumns(value)}
                    className={
                      props.libraryColumns === value
                        ? styles.enabledMenuItem
                        : ''
                    }
                  >
                    {value}
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
              <Menu.SubMenu
                key={'Layout'}
                title={'Layout'}
                popupOffset={[-4, 0]}
              >
                <Menu.Item
                  key={LibraryView.Grid}
                  onClick={() => props.setLibraryViews(LibraryView.Grid)}
                  className={
                    props.libraryViews === LibraryView.Grid
                      ? styles.enabledMenuItem
                      : ''
                  }
                >
                  Grid
                </Menu.Item>
                <Menu.Item
                  key={LibraryView.List}
                  onClick={() => props.setLibraryViews(LibraryView.List)}
                  className={
                    props.libraryViews === LibraryView.List
                      ? styles.enabledMenuItem
                      : ''
                  }
                >
                  List
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu key={'Sort'} title={'Sort'} popupOffset={[-4, 0]}>
                {Object.values(LibrarySort).map((value) => (
                  <Menu.Item
                    key={value}
                    onClick={() => props.setLibrarySort(value)}
                    className={
                      props.librarySort === value ? styles.enabledMenuItem : ''
                    }
                  >
                    {LIBRARY_SORT_TEXT[value]}
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            </Menu>
          }
        >
          <Button>
            View <DownOutlined />
          </Button>
        </Dropdown>
        <Dropdown
          className={styles.statusDropdown}
          overlay={
            <Menu
              openKeys={[filterSubmenu]}
              onOpenChange={(keys) => setFilterSubmenu(keys.pop() || '')}
            >
              <Menu.SubMenu
                key={'Progress'}
                title={'Progress'}
                popupOffset={[-4, 0]}
              >
                {Object.values(ProgressFilter).map((value) => (
                  <Menu.Item
                    key={value}
                    onClick={() => props.setLibraryFilterProgress(value)}
                    className={
                      props.libraryFilterProgress === value
                        ? styles.enabledMenuItem
                        : ''
                    }
                  >
                    {value}
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
              <Menu.SubMenu
                key={'Status'}
                title={'Status'}
                popupOffset={[-4, 0]}
              >
                {[[null, 'Any'], ...Object.entries(SeriesStatus)].map(
                  ([seriesStatus, text]) => (
                    <Menu.Item
                      key={text}
                      onClick={() =>
                        props.setLibraryFilterStatus(
                          seriesStatus as SeriesStatus
                        )
                      }
                      className={
                        props.libraryFilterStatus === seriesStatus ||
                        (props.libraryFilterProgress === undefined &&
                          seriesStatus === null)
                          ? styles.enabledMenuItem
                          : ''
                      }
                    >
                      {text}
                    </Menu.Item>
                  )
                )}
              </Menu.SubMenu>
            </Menu>
          }
        >
          <Button>
            Filter <DownOutlined />
          </Button>
        </Dropdown>
        <Input
          className={styles.seriesFilter}
          placeholder="Search your library..."
          onChange={(e) => props.setFilter(e.target.value)}
        />
      </Header>
    </>
  );
};

export default connector(LibraryControlBar);
