/* eslint-disable react/jsx-boolean-value */
import React from 'react';
import { SeriesStatus, TriState } from 'houdoku-extension-lib';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Button, Group, Input, Menu } from '@mantine/core';
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconColumns,
  IconHash,
  IconLayoutGrid,
  IconLayoutList,
  IconLetterA,
  IconSearch,
  IconX,
} from '@tabler/icons';
import { reloadSeriesList } from '../../features/library/utils';
import { LibrarySort, LibraryView, ProgressFilter } from '../../models/types';
import {
  categoryListState,
  filterCategoriesState,
  filterState,
  reloadingSeriesListState,
  seriesListState,
} from '../../state/libraryStates';
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

const SORT_ICONS = {
  [LibrarySort.TitleAsc]: <IconArrowUp size={14} />,
  [LibrarySort.TitleDesc]: <IconArrowDown size={14} />,
  [LibrarySort.UnreadAsc]: <IconArrowUp size={14} />,
  [LibrarySort.UnreadDesc]: <IconArrowDown size={14} />,
};

const TRISTATE_ICONS = {
  [TriState.IGNORE]: undefined,
  [TriState.INCLUDE]: <IconCheck size={14} />,
  [TriState.EXCLUDE]: <IconX size={14} />,
};

const TRISTATE_NEXT = {
  [TriState.IGNORE]: TriState.INCLUDE,
  [TriState.INCLUDE]: TriState.EXCLUDE,
  [TriState.EXCLUDE]: TriState.IGNORE,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LibraryControlBar: React.FC<Props> = (_props: Props) => {
  const [seriesList, setSeriesList] = useRecoilState(seriesListState);
  const [reloadingSeriesList, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const availableCategories = useRecoilValue(categoryListState);
  const setFilter = useSetRecoilState(filterState);
  const [filterCategories, setFilterCategories] = useRecoilState(filterCategoriesState);
  const [libraryFilterStatus, setLibraryFilterStatus] = useRecoilState(libraryFilterStatusState);
  const [libraryFilterProgress, setLibraryFilterProgress] = useRecoilState(
    libraryFilterProgressState
  );
  const [libraryColumns, setLibraryColumns] = useRecoilState(libraryColumnsState);
  const [libraryViews, setLibraryViews] = useRecoilState(libraryViewsState);
  const [librarySort, setLibrarySort] = useRecoilState(librarySortState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);

  const refreshHandler = () => {
    if (!reloadingSeriesList) {
      reloadSeriesList(seriesList, setSeriesList, setReloadingSeriesList, chapterLanguages);
    }
  };

  return (
    <Group position="apart" mb="md" noWrap>
      <Group position="left" align="left" spacing="xs" noWrap>
        <Button onClick={refreshHandler} loading={reloadingSeriesList}>
          {reloadingSeriesList ? 'Refreshing...' : 'Refresh'}{' '}
        </Button>
        <Menu shadow="md" trigger="hover" closeOnItemClick={false} width={160}>
          <Menu.Target>
            <Button variant="default">Layout</Button>
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
            <Button variant="default">Filters</Button>
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

        <Menu shadow="md" trigger="hover" closeOnItemClick={false} width={160}>
          <Menu.Target>
            <Button variant="default">Categories</Button>
          </Menu.Target>

          <Menu.Dropdown>
            {availableCategories.map((availableCategory) => {
              const value = filterCategories[availableCategory.id] || TriState.IGNORE;

              return (
                <Menu.Item
                  key={availableCategory.id}
                  onClick={() =>
                    setFilterCategories({
                      ...filterCategories,
                      [availableCategory.id]: TRISTATE_NEXT[value],
                    })
                  }
                  onContextMenu={() =>
                    setFilterCategories({
                      ...filterCategories,
                      [availableCategory.id]: TriState.IGNORE,
                    })
                  }
                  rightSection={TRISTATE_ICONS[value]}
                >
                  {availableCategory.label}
                </Menu.Item>
              );
            })}
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
