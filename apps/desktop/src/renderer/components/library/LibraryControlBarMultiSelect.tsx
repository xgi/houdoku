import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { markChapters, reloadSeriesList } from '@/renderer/features/library/utils';
import {
  categoryListState,
  chapterListState,
  multiSelectEnabledState,
  multiSelectSeriesListState,
  reloadingSeriesListState,
  seriesListState,
  seriesState,
} from '@/renderer/state/libraryStates';
import { chapterLanguagesState } from '@/renderer/state/settingStates';
import library from '@/renderer/services/library';
import { Button } from '@houdoku/ui/components/Button';
import { CheckCheck, Loader2, TagsIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@houdoku/ui/components/DropdownMenu';
import { Category } from '@/common/models/types';

type Props = {
  showAssignCategoriesModal: () => void;
};

const LibraryControlBarMultiSelect: React.FC<Props> = () => {
  const setSeries = useSetRecoilState(seriesState);
  const setSeriesList = useSetRecoilState(seriesListState);
  const setChapterList = useSetRecoilState(chapterListState);
  const [reloadingSeriesList, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const setMultiSelectEnabled = useSetRecoilState(multiSelectEnabledState);
  const multiSelectSeriesList = useRecoilValue(multiSelectSeriesListState);
  const categories = useRecoilValue(categoryListState);

  const refreshHandler = () => {
    setMultiSelectEnabled(false);
    if (!reloadingSeriesList) {
      reloadSeriesList(
        multiSelectSeriesList,
        setSeriesList,
        setReloadingSeriesList,
        chapterLanguages,
      );
    }
  };

  const markAllReadHandler = () => {
    setMultiSelectEnabled(false);
    multiSelectSeriesList.forEach((series) => {
      if (series.id) {
        const chapters = library.fetchChapters(series.id!);
        markChapters(chapters, series, true, setChapterList, setSeries, chapterLanguages);
        setSeriesList(library.fetchSeriesList());
      }
    });
  };

  const assignCategory = (category: Category) => {
    setMultiSelectEnabled(false);
    multiSelectSeriesList.forEach((series) => {
      const newCategories = series.categories
        ? Array.from(new Set([...series.categories, category.id]))
        : [category.id];
      library.upsertSeries({ ...series, categories: newCategories });
    });
    setSeriesList(library.fetchSeriesList());
  };

  return (
    <div className="flex justify-between flex-nowrap py-3">
      <div className="flex gap-3 flex-nowrap">
        <Button disabled={reloadingSeriesList} onClick={refreshHandler}>
          {reloadingSeriesList && <Loader2 className="animate-spin" />}
          {reloadingSeriesList ? 'Refreshing...' : 'Refresh'}{' '}
        </Button>

        <Button onClick={markAllReadHandler} variant="outline">
          <CheckCheck />
          Mark selected read
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <TagsIcon className="w-4 h-4" />
              Assign category
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44">
            <DropdownMenuLabel>Categories</DropdownMenuLabel>
            <DropdownMenuGroup>
              {categories.map((category) => (
                <DropdownMenuItem key={category.id} onSelect={() => assignCategory(category)}>
                  {category.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex gap-3 flex-nowrap justify-end">
        <span className="self-center">{multiSelectSeriesList.length} series selected</span>
        <Button onClick={() => setMultiSelectEnabled(false)}>Exit multi-select</Button>
      </div>
    </div>
  );
};

export default LibraryControlBarMultiSelect;
