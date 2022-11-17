/* eslint-disable react/jsx-boolean-value */
import React from 'react';
import { SeriesStatus } from 'houdoku-extension-lib';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Button, Group, Input, Menu, ScrollArea } from '@mantine/core';
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconColumns,
  IconEdit,
  IconHash,
  IconLayoutGrid,
  IconLayoutList,
  IconLetterA,
  IconSearch,
} from '@tabler/icons';
import { reloadSeriesList } from '../../features/library/utils';
import { LibrarySort, LibraryView, ProgressFilter } from '../../models/types';
import {
  categoryListState,
  filterCategoryState,
  filterState,
  reloadingSeriesListState,
  seriesListState,
  showingLibraryCtxMenuState,
} from '../../state/libraryStates';
import {
  libraryFilterStatusState,
  libraryFilterProgressState,
  libraryColumnsState,
  libraryViewsState,
  librarySortState,
  chapterLanguagesState,
} from '../../state/settingStates';

type Props = {
  showEditCategoriesModal: () => void;
};

const SORT_ICONS = {
  [LibrarySort.TitleAsc]: <IconArrowUp size={14} />,
  [LibrarySort.TitleDesc]: <IconArrowDown size={14} />,
  [LibrarySort.UnreadAsc]: <IconArrowUp size={14} />,
  [LibrarySort.UnreadDesc]: <IconArrowDown size={14} />,
};

const LibraryControlBar: React.FC<Props> = (props: Props) => {
  const [seriesList, setSeriesList] = useRecoilState(seriesListState);
  const [reloadingSeriesList, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const availableCategories = useRecoilValue(categoryListState);
  const setFilter = useSetRecoilState(filterState);
  const [filterCategory, setFilterCategory] = useRecoilState(filterCategoryState);
  const [libraryFilterStatus, setLibraryFilterStatus] = useRecoilState(libraryFilterStatusState);
  const [libraryFilterProgress, setLibraryFilterProgress] = useRecoilState(
    libraryFilterProgressState
  );
  const [libraryColumns, setLibraryColumns] = useRecoilState(libraryColumnsState);
  const [libraryViews, setLibraryViews] = useRecoilState(libraryViewsState);
  const [librarySort, setLibrarySort] = useRecoilState(librarySortState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const categoryList = useRecoilValue(categoryListState);
  const setShowingContextMenu = useSetRecoilState(showingLibraryCtxMenuState);

  const refreshHandler = () => {
    if (!reloadingSeriesList) {
      reloadSeriesList(
        seriesList,
        setSeriesList,
        setReloadingSeriesList,
        chapterLanguages,
        categoryList
      );
    }
  };

  return (
    <Group position="apart" mb="md" noWrap>
      <Group position="left" align="left" spacing="xs" noWrap>
        <Button
          onClick={refreshHandler}
          loading={reloadingSeriesList}
          onMouseEnter={() => setShowingContextMenu(false)}
        >
          {reloadingSeriesList ? 'Refreshing...' : 'Refresh'}{' '}
        </Button>
        <Menu shadow="md" trigger="hover" closeOnItemClick={false} width={160}>
          <Menu.Target>
            <Button variant="default" onMouseEnter={() => setShowingContextMenu(false)}>
              Layout
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>View</Menu.Label>
            <Menu.Item
              icon={<IconLayoutGrid size={14} />}
              onClick={() => setLibraryViews(LibraryView.Grid)}
              rightSection={libraryViews === LibraryView.Grid ? <IconCheck size={14} /> : ''}
            >
              Grid
            </Menu.Item>
            <Menu.Item
              icon={<IconLayoutList size={14} />}
              onClick={() => setLibraryViews(LibraryView.List)}
              rightSection={libraryViews === LibraryView.List ? <IconCheck size={14} /> : ''}
            >
              List
            </Menu.Item>
            <Menu.Divider />
            <Menu.Label>Sort</Menu.Label>
            <Menu.Item
              icon={<IconLetterA size={14} />}
              onClick={() =>
                setLibrarySort(
                  librarySort === LibrarySort.TitleAsc
                    ? LibrarySort.TitleDesc
                    : LibrarySort.TitleAsc
                )
              }
              rightSection={
                [LibrarySort.TitleAsc, LibrarySort.TitleDesc].includes(librarySort)
                  ? SORT_ICONS[librarySort]
                  : ''
              }
            >
              Title
            </Menu.Item>
            <Menu.Item
              icon={<IconHash size={14} />}
              onClick={() =>
                setLibrarySort(
                  librarySort === LibrarySort.UnreadDesc
                    ? LibrarySort.UnreadAsc
                    : LibrarySort.UnreadDesc
                )
              }
              rightSection={
                [LibrarySort.UnreadAsc, LibrarySort.UnreadDesc].includes(librarySort)
                  ? SORT_ICONS[librarySort]
                  : ''
              }
            >
              Unread
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              icon={<IconColumns size={14} />}
              disabled={libraryViews !== LibraryView.Grid}
              onClick={() =>
                setLibraryColumns(
                  {
                    2: 4,
                    4: 6,
                    6: 8,
                    8: 2,
                  }[libraryColumns as 2 | 4 | 6 | 8]
                )
              }
              rightSection={libraryColumns}
            >
              Columns
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Menu shadow="md" trigger="hover" closeOnItemClick={false} width={160}>
          <Menu.Target>
            <Button variant="default" onMouseEnter={() => setShowingContextMenu(false)}>
              Filters
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Progress</Menu.Label>
            {Object.values(ProgressFilter).map((value) => (
              <Menu.Item
                key={value}
                onClick={() => setLibraryFilterProgress(value)}
                rightSection={libraryFilterProgress === value ? <IconCheck size={14} /> : ''}
              >
                {value}
              </Menu.Item>
            ))}
            <Menu.Divider />
            <Menu.Label>Status</Menu.Label>
            {[[null, 'Any'], ...Object.entries(SeriesStatus)].map(([seriesStatus, text]) => (
              <Menu.Item
                key={text}
                onClick={() => setLibraryFilterStatus(seriesStatus ? (text as SeriesStatus) : null)}
                rightSection={
                  libraryFilterStatus === text ||
                  (libraryFilterStatus === null && seriesStatus === null) ? (
                    <IconCheck size={14} />
                  ) : (
                    ''
                  )
                }
              >
                {text}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        <Menu shadow="md" trigger="hover" closeOnItemClick={true} width={200}>
          <Menu.Target>
            <Button
              variant="default"
              onContextMenu={() => setFilterCategory('')}
              onMouseEnter={() => setShowingContextMenu(false)}
            >
              Category
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <ScrollArea.Autosize maxHeight={320}>
              {availableCategories.map((availableCategory) => {
                return (
                  <Menu.Item
                    pr="lg"
                    key={availableCategory.id}
                    onClick={() => {
                      if (availableCategory.id === filterCategory) setFilterCategory('');
                      else setFilterCategory(availableCategory.id);
                    }}
                    rightSection={
                      availableCategory.id === filterCategory ? <IconCheck size={14} /> : undefined
                    }
                  >
                    {availableCategory.label}
                  </Menu.Item>
                );
              })}

              {availableCategories.length > 0 ? (
                <Menu.Divider style={{ width: '100%' }} />
              ) : undefined}

              <Menu.Item
                icon={<IconEdit size={14} />}
                onClick={() => props.showEditCategoriesModal()}
              >
                Edit categories
              </Menu.Item>
            </ScrollArea.Autosize>
          </Menu.Dropdown>
        </Menu>
      </Group>
      <Group position="right" align="right" noWrap>
        <Input
          placeholder="Search library..."
          icon={<IconSearch size={16} />}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
        />
      </Group>
    </Group>
  );
};

export default LibraryControlBar;
