import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import LibraryControlBar from './LibraryControlBar';
import { LibrarySort, LibraryView, ProgressFilter } from '@/common/models/types';
import {
  activeSeriesListState,
  chapterListState,
  filterState,
  multiSelectEnabledState,
  seriesListState,
  seriesState,
} from '@/renderer/state/libraryStates';
import {
  libraryFilterStatusState,
  libraryFilterProgressState,
  librarySortState,
  libraryViewState,
  libraryFilterCategoryState,
} from '@/renderer/state/settingStates';
import LibraryGrid from './LibraryGrid';
import RemoveSeriesModal from './RemoveSeriesModal';
import LibraryList from './LibraryList';
import library from '@/renderer/services/library';
import EditCategoriesModal from './EditCategoriesModal';
import LibraryControlBarMultiSelect from './LibraryControlBarMultiSelect';
import DefaultText from '../general/DefaultText';
import { ScrollArea } from '@/ui/components/ScrollArea';

type Props = unknown;

const Library: React.FC<Props> = () => {
  const [removeModalShowing, setRemoveModalShowing] = useState(false);
  const [removeModalSeries, setRemoveModalSeries] = useState<Series | null>(null);
  const [editCategoriesModalShowing, setEditCategoriesModalShowing] = useState(false);
  const activeSeriesList = useRecoilValue(activeSeriesListState);
  const [multiSelectEnabled, setMultiSelectEnabled] = useRecoilState(multiSelectEnabledState);
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
    setMultiSelectEnabled(false);
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
      <DefaultText ta="center" style={{ paddingTop: '30vh' }}>
        Your library is empty. Install{' '}
        <DefaultText component="span" c="violet" fw={700}>
          Plugins
        </DefaultText>{' '}
        from the tab on the left,
        <br />
        and then go to{' '}
        <DefaultText component="span" c="teal" fw={700}>
          Add Series
        </DefaultText>{' '}
        to start building your library.
      </DefaultText>
    );
  };

  useEffect(() => setSeriesList(library.fetchSeriesList()), [setSeriesList]);

  return (
    <div>
      {multiSelectEnabled ? (
        <LibraryControlBarMultiSelect
          showAssignCategoriesModal={() => console.log('TODO placeholder')}
        />
      ) : (
        <LibraryControlBar />
      )}
      <ScrollArea className="h-[calc(100vh-20px-64px)] w-full pr-4 -mr-2">
        {activeSeriesList.length > 0 ? renderLibrary() : renderEmptyMessage()}
      </ScrollArea>
    </div>
  );
};

export default Library;
