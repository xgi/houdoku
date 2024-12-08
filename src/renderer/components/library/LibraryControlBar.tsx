import React from 'react';
import { SeriesStatus } from '@tiyo/common';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Group, Menu, ScrollArea } from '@mantine/core';
import {
  IconArrowDown,
  IconArrowUp,
  IconCheck,
  IconColumns,
  IconEdit,
  IconHash,
  IconLayoutBottombar,
  IconLayoutGrid,
  IconLayoutList,
  IconLetterA,
  IconPhoto,
  IconSearch,
} from '@tabler/icons';
import { reloadSeriesList } from '@/renderer/features/library/utils';
import { LibrarySort, LibraryView, ProgressFilter } from '@/common/models/types';
import {
  activeSeriesListState,
  categoryListState,
  filterState,
  reloadingSeriesListState,
  seriesListState,
} from '@/renderer/state/libraryStates';
import {
  libraryFilterStatusState,
  libraryFilterProgressState,
  libraryColumnsState,
  libraryViewState,
  librarySortState,
  chapterLanguagesState,
  libraryFilterCategoryState,
  themeState,
} from '@/renderer/state/settingStates';
import DefaultButton from '../general/DefaultButton';
import DefaultInput from '../general/DefaultInput';
import DefaultMenu from '../general/DefaultMenu';
import { themeProps } from '@/renderer/util/themes';

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
  const theme = useRecoilValue(themeState);
  const setSeriesList = useSetRecoilState(seriesListState);
  const activeSeriesList = useRecoilValue(activeSeriesListState);
  const [reloadingSeriesList, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const availableCategories = useRecoilValue(categoryListState);
  const setFilter = useSetRecoilState(filterState);
  const [libraryFilterCategory, setLibraryFilterCategory] = useRecoilState(
    libraryFilterCategoryState,
  );
  const [libraryFilterStatus, setLibraryFilterStatus] = useRecoilState(libraryFilterStatusState);
  const [libraryFilterProgress, setLibraryFilterProgress] = useRecoilState(
    libraryFilterProgressState,
  );
  const [libraryColumns, setLibraryColumns] = useRecoilState(libraryColumnsState);
  const [libraryView, setLibraryView] = useRecoilState(libraryViewState);
  const [librarySort, setLibrarySort] = useRecoilState(librarySortState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const categoryList = useRecoilValue(categoryListState);

  const refreshHandler = () => {
    if (!reloadingSeriesList) {
      reloadSeriesList(
        activeSeriesList,
        setSeriesList,
        setReloadingSeriesList,
        chapterLanguages,
        categoryList,
      );
    }
  };

  return (
    <Group justify="space-between" pt="sm" mb="md" wrap="nowrap">
      <Group align="left" gap="xs" wrap="nowrap">
        <DefaultButton oc="blue" onClick={refreshHandler} loading={reloadingSeriesList}>
          {reloadingSeriesList ? 'Refreshing...' : 'Refresh'}{' '}
        </DefaultButton>
        <DefaultMenu shadow="md" trigger="hover" closeOnItemClick={false} width={200}>
          <Menu.Target>
            <DefaultButton variant="default">Layout</DefaultButton>
          </Menu.Target>

          <Menu.Dropdown {...themeProps(theme)}>
            <Menu.Label>View</Menu.Label>
            <Menu.Item
              leftSection={<IconLayoutGrid size={14} />}
              rightSection={libraryView === LibraryView.GridCompact ? <IconCheck size={14} /> : ''}
              onClick={() => setLibraryView(LibraryView.GridCompact)}
            >
              Compact Grid
            </Menu.Item>
            <Menu.Item
              leftSection={<IconLayoutBottombar size={14} />}
              rightSection={
                libraryView === LibraryView.GridComfortable ? <IconCheck size={14} /> : ''
              }
              onClick={() => setLibraryView(LibraryView.GridComfortable)}
            >
              Comfortable Grid
            </Menu.Item>
            <Menu.Item
              leftSection={<IconPhoto size={14} />}
              rightSection={
                libraryView === LibraryView.GridCoversOnly ? <IconCheck size={14} /> : ''
              }
              onClick={() => setLibraryView(LibraryView.GridCoversOnly)}
            >
              Cover Grid
            </Menu.Item>
            <Menu.Item
              leftSection={<IconLayoutList size={14} />}
              rightSection={libraryView === LibraryView.List ? <IconCheck size={14} /> : ''}
              onClick={() => setLibraryView(LibraryView.List)}
            >
              List
            </Menu.Item>
            <Menu.Divider />
            <Menu.Label>Sort</Menu.Label>
            <Menu.Item
              leftSection={<IconLetterA size={14} />}
              rightSection={
                [LibrarySort.TitleAsc, LibrarySort.TitleDesc].includes(librarySort)
                  ? SORT_ICONS[librarySort]
                  : ''
              }
              onClick={() =>
                setLibrarySort(
                  librarySort === LibrarySort.TitleAsc
                    ? LibrarySort.TitleDesc
                    : LibrarySort.TitleAsc,
                )
              }
            >
              Title
            </Menu.Item>
            <Menu.Item
              leftSection={<IconHash size={14} />}
              rightSection={
                [LibrarySort.UnreadAsc, LibrarySort.UnreadDesc].includes(librarySort)
                  ? SORT_ICONS[librarySort]
                  : ''
              }
              onClick={() =>
                setLibrarySort(
                  librarySort === LibrarySort.UnreadDesc
                    ? LibrarySort.UnreadAsc
                    : LibrarySort.UnreadDesc,
                )
              }
            >
              Unread
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              disabled={libraryView === LibraryView.List}
              leftSection={<IconColumns size={14} />}
              rightSection={libraryColumns}
              onClick={() =>
                setLibraryColumns(
                  {
                    2: 4,
                    4: 6,
                    6: 8,
                    8: 2,
                  }[libraryColumns as 2 | 4 | 6 | 8],
                )
              }
            >
              Columns
            </Menu.Item>
          </Menu.Dropdown>
        </DefaultMenu>

        <DefaultMenu shadow="md" trigger="hover" closeOnItemClick={false} width={160}>
          <Menu.Target>
            <DefaultButton variant="default">Filters</DefaultButton>
          </Menu.Target>

          <Menu.Dropdown {...themeProps(theme)}>
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
        </DefaultMenu>

        <DefaultMenu shadow="md" trigger="hover" closeOnItemClick={true} width={200}>
          <Menu.Target>
            <DefaultButton variant="default" onContextMenu={() => setLibraryFilterCategory('')}>
              Category
            </DefaultButton>
          </Menu.Target>

          <Menu.Dropdown {...themeProps(theme)}>
            <ScrollArea.Autosize mah={320}>
              {availableCategories.map((availableCategory) => {
                return (
                  <Menu.Item
                    pr="lg"
                    key={availableCategory.id}
                    onClick={() => {
                      if (availableCategory.id === libraryFilterCategory)
                        setLibraryFilterCategory('');
                      else setLibraryFilterCategory(availableCategory.id);
                    }}
                    rightSection={
                      availableCategory.id === libraryFilterCategory ? (
                        <IconCheck size={14} />
                      ) : undefined
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
                leftSection={<IconEdit size={14} />}
                onClick={() => props.showEditCategoriesModal()}
              >
                Edit categories
              </Menu.Item>
            </ScrollArea.Autosize>
          </Menu.Dropdown>
        </DefaultMenu>
      </Group>
      <Group justify="flex-end" align="right" wrap="nowrap">
        <DefaultInput
          placeholder="Search library..."
          leftSection={<IconSearch size={16} />}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
        />
      </Group>
    </Group>
  );
};

export default LibraryControlBar;
