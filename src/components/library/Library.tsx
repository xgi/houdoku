import React, { useEffect, useState } from 'react';
import { Series } from 'houdoku-extension-lib';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ScrollArea, Text } from '@mantine/core';
import LibraryControlBar from './LibraryControlBar';
import { LibrarySort, LibraryView, ProgressFilter } from '../../models/types';
import {
  activeSeriesListState,
  chapterListState,
  filterState,
  seriesListState,
  seriesState,
} from '../../state/libraryStates';
import {
  libraryFilterStatusState,
  libraryFilterProgressState,
  librarySortState,
  libraryViewState,
  libraryFilterCategoryState,
} from '../../state/settingStates';
import LibraryGrid from './LibraryGrid';
import RemoveSeriesModal from './RemoveSeriesModal';
import LibraryList from './LibraryList';
import library from '../../services/library';
import EditCategoriesModal from './EditCategoriesModal';

type Props = unknown;

const Library: React.FC<Props> = () => {
  const [removeModalShowing, setRemoveModalShowing] = useState(false);
  const [removeModalSeries, setRemoveModalSeries] = useState<Series | null>(null);
  const [editCategoriesModalShowing, setEditCategoriesModalShowing] = useState(false);
  const activeSeriesList = useRecoilValue(activeSeriesListState);
  const filter = useRecoilValue(filterState);
  const libraryFilterCategory = useRecoilValue(libraryFilterCategoryState);
  const libraryFilterStatus = useRecoilValue(libraryFilterStatusState);
  const libraryFilterProgress = useRecoilValue(libraryFilterProgressState);
  const libraryView = useRecoilValue(libraryViewState);
  const librarySort = useRecoilValue(librarySortState);
  const setSeries = useSetRecoilState(seriesState);
  const setSeriesList = useSetRecoilState(seriesListState);
  const setChapterList = useSetRecoilState(chapterListState);

  useEffect(() => {
    setSeries(undefined);
    setChapterList([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Get a filtered (and sorted) list of series after applying the specified filters.
   * TODO: this can probably be moved into a Recoil selector
   * @param seriesList the list of series to filter
   * @returns a sorted list of series matching all filter props
   */
  const getFilteredList = (): Series[] => {
    const filteredList = activeSeriesList.filter((series: Series) => {
      if (!series) return false;

      if (!series.title.toLowerCase().includes(filter.toLowerCase())) return false;
      if (libraryFilterStatus !== null && series.status !== libraryFilterStatus) {
        return false;
      }
      if (libraryFilterProgress === ProgressFilter.Unread && series.numberUnread === 0) {
        return false;
      }
      if (libraryFilterProgress === ProgressFilter.Finished && series.numberUnread > 0) {
        return false;
      }

      if (libraryFilterCategory) {
        if (!series.categories || !series.categories.includes(libraryFilterCategory)) return false;
      }

      return true;
    });

    switch (librarySort) {
      case LibrarySort.UnreadAsc:
        return filteredList.sort((a: Series, b: Series) => a.numberUnread - b.numberUnread);
      case LibrarySort.UnreadDesc:
        return filteredList.sort((a: Series, b: Series) => b.numberUnread - a.numberUnread);
      case LibrarySort.TitleAsc:
        return filteredList.sort((a: Series, b: Series) => a.title.localeCompare(b.title));
      case LibrarySort.TitleDesc:
        return filteredList.sort((a: Series, b: Series) => b.title.localeCompare(a.title));
      default:
        return filteredList;
    }
  };

  const renderLibrary = () => {
    return (
      <>
        <RemoveSeriesModal
          series={removeModalSeries}
          showing={removeModalShowing}
          close={() => setRemoveModalShowing(false)}
        />
        <EditCategoriesModal
          showing={editCategoriesModalShowing}
          close={() => setEditCategoriesModalShowing(false)}
        />

        {libraryView === LibraryView.List ? (
          <LibraryList
            getFilteredList={getFilteredList}
            showRemoveModal={(series) => {
              setRemoveModalSeries(series);
              setRemoveModalShowing(true);
            }}
          />
        ) : (
          <LibraryGrid
            getFilteredList={getFilteredList}
            showRemoveModal={(series) => {
              setRemoveModalSeries(series);
              setRemoveModalShowing(true);
            }}
          />
        )}
      </>
    );
  };

  const renderEmptyMessage = () => {
    return (
      <Text align="center" style={{ paddingTop: '30vh' }}>
        Your library is empty. Install{' '}
        <Text component="span" color="violet" weight={700}>
          Extensions
        </Text>{' '}
        from the tab on the left,
        <br />
        and then go to{' '}
        <Text component="span" color="teal" weight={700}>
          Add Series
        </Text>{' '}
        to start building your library.
      </Text>
    );
  };

  useEffect(() => setSeriesList(library.fetchSeriesList()), [setSeriesList]);

  return (
    <>
      <LibraryControlBar showEditCategoriesModal={() => setEditCategoriesModalShowing(true)} />
      <ScrollArea style={{ height: 'calc(100vh - 24px - 72px)' }} pr="xl" mr={-16}>
        {activeSeriesList.length > 0 ? renderLibrary() : renderEmptyMessage()}
      </ScrollArea>
    </>
  );
};

export default Library;
