/* eslint-disable react/jsx-boolean-value */
import React, { useState } from 'react';
import { Button, Input, Dropdown, Menu } from 'antd';
import { DownOutlined, SyncOutlined } from '@ant-design/icons';
import { Header } from 'antd/lib/layout/layout';
import { SeriesStatus } from 'houdoku-extension-lib';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import styles from './LibraryControlBar.css';
import { reloadSeriesList } from '../../features/library/utils';
import { LibrarySort, LibraryView, ProgressFilter } from '../../models/types';
import { filterState, reloadingSeriesListState, seriesListState } from '../../state/libraryStates';
import { statusTextState } from '../../state/statusBarStates';
import {
  libraryFilterStatusState,
  libraryFilterProgressState,
  libraryColumnsState,
  libraryViewsState,
  librarySortState,
  chapterLanguagesState,
} from '../../state/settingStates';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const LIBRARY_SORT_TEXT = {
  [LibrarySort.TitleAsc]: 'Title Asc',
  [LibrarySort.TitleDesc]: 'Title Desc',
  [LibrarySort.UnreadAsc]: 'Unread Asc',
  [LibrarySort.UnreadDesc]: 'Unread Desc',
};

const LibraryControlBar: React.FC<Props> = (props: Props) => {
  const [seriesList, setSeriesList] = useRecoilState(seriesListState);
  const [reloadingSeriesList, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const setFilter = useSetRecoilState(filterState);
  const setStatusText = useSetRecoilState(statusTextState);
  const [libraryFilterStatus, setLibraryFilterStatus] = useRecoilState(libraryFilterStatusState);
  const [libraryFilterProgress, setLibraryFilterProgress] = useRecoilState(
    libraryFilterProgressState
  );
  const [libraryColumns, setLibraryColumns] = useRecoilState(libraryColumnsState);
  const [libraryViews, setLibraryViews] = useRecoilState(libraryViewsState);
  const [librarySort, setLibrarySort] = useRecoilState(librarySortState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const [viewSubmenu, setViewSubmenu] = useState('');
  const [filterSubmenu, setFilterSubmenu] = useState('');

  return (
    <Header className={styles.header}>
      <Button
        className={styles.reloadButton}
        type="primary"
        onClick={() => {
          if (!reloadingSeriesList) {
            reloadSeriesList(
              seriesList,
              setSeriesList,
              setReloadingSeriesList,
              setStatusText,
              chapterLanguages
            );
          }
        }}
      >
        {reloadingSeriesList ? <SyncOutlined spin /> : 'Refresh'}
      </Button>
      <Dropdown
        className={styles.libraryViewDropdown}
        overlay={
          <Menu openKeys={[viewSubmenu]} onOpenChange={(keys) => setViewSubmenu(keys.pop() || '')}>
            <Menu.SubMenu key="Columns" title="Columns" popupOffset={[-4, 0]}>
              {[2, 4, 6, 8].map((value) => (
                <Menu.Item
                  key={`columns-${value}`}
                  onClick={() => setLibraryColumns(value)}
                  className={libraryColumns === value ? styles.enabledMenuItem : ''}
                >
                  {value}
                </Menu.Item>
              ))}
            </Menu.SubMenu>
            <Menu.SubMenu key="Layout" title="Layout" popupOffset={[-4, 0]}>
              <Menu.Item
                key={LibraryView.Grid}
                onClick={() => setLibraryViews(LibraryView.Grid)}
                className={libraryViews === LibraryView.Grid ? styles.enabledMenuItem : ''}
              >
                Grid
              </Menu.Item>
              <Menu.Item
                key={LibraryView.List}
                onClick={() => setLibraryViews(LibraryView.List)}
                className={libraryViews === LibraryView.List ? styles.enabledMenuItem : ''}
              >
                List
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="Sort" title="Sort" popupOffset={[-4, 0]}>
              {Object.values(LibrarySort).map((value) => (
                <Menu.Item
                  key={value}
                  onClick={() => setLibrarySort(value)}
                  className={librarySort === value ? styles.enabledMenuItem : ''}
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
            <Menu.SubMenu key="Progress" title="Progress" popupOffset={[-4, 0]}>
              {Object.values(ProgressFilter).map((value) => (
                <Menu.Item
                  key={value}
                  onClick={() => setLibraryFilterProgress(value)}
                  className={libraryFilterProgress === value ? styles.enabledMenuItem : ''}
                >
                  {value}
                </Menu.Item>
              ))}
            </Menu.SubMenu>
            <Menu.SubMenu key="Status" title="Status" popupOffset={[-4, 0]}>
              {[[null, 'Any'], ...Object.entries(SeriesStatus)].map(([seriesStatus, text]) => (
                <Menu.Item
                  key={text}
                  onClick={() => setLibraryFilterStatus(seriesStatus as SeriesStatus)}
                  className={
                    libraryFilterStatus === seriesStatus ||
                    (libraryFilterProgress === undefined && seriesStatus === null)
                      ? styles.enabledMenuItem
                      : ''
                  }
                >
                  {text}
                </Menu.Item>
              ))}
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
        onChange={(e) => setFilter(e.target.value)}
      />
    </Header>
  );
};

export default LibraryControlBar;
