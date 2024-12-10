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
import { Button } from '@/ui/components/Button';
import { CheckCheck, Loader2 } from 'lucide-react';

type Props = {
  showAssignCategoriesModal: () => void;
};

const LibraryControlBarMultiSelect: React.FC<Props> = () => {
  const setSeries = useSetRecoilState(seriesState);
  const setSeriesList = useSetRecoilState(seriesListState);
  const setChapterList = useSetRecoilState(chapterListState);
  const [reloadingSeriesList, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const categoryList = useRecoilValue(categoryListState);
  const setMultiSelectEnabled = useSetRecoilState(multiSelectEnabledState);
  const multiSelectSeriesList = useRecoilValue(multiSelectSeriesListState);

  const refreshHandler = () => {
    setMultiSelectEnabled(false);
    if (!reloadingSeriesList) {
      reloadSeriesList(
        multiSelectSeriesList,
        setSeriesList,
        setReloadingSeriesList,
        chapterLanguages,
        categoryList,
      );
    }
  };

  const markAllReadHandler = () => {
    setMultiSelectEnabled(false);
    multiSelectSeriesList.forEach((series) => {
      console.log(series);
      if (series.id) {
        const chapters = library.fetchChapters(series.id!);
        markChapters(chapters, series, true, setChapterList, setSeries, chapterLanguages);
        setSeriesList(library.fetchSeriesList());
      }
    });
  };

  return (
    <div className="flex justify-between flex-nowrap py-3">
      <div className="flex gap-3 flex-nowrap">
        <Button disabled={reloadingSeriesList} onClick={refreshHandler}>
          {reloadingSeriesList && <Loader2 className="animate-spin" />}
          {reloadingSeriesList ? 'Refreshing...' : 'Refresh'}{' '}
        </Button>
        {/* <Button variant="default" leftSection={<IconTag size={14} />}>
          Assign categories
        </Button> */}
        <Button onClick={markAllReadHandler} variant="outline">
          <CheckCheck />
          Mark selected read
        </Button>
      </div>

      <div className="flex gap-3 flex-nowrap justify-end">
        <span className="self-center">{multiSelectSeriesList.length} series selected</span>
        <Button onClick={() => setMultiSelectEnabled(false)}>Exit multi-select</Button>
      </div>
    </div>
  );
};

export default LibraryControlBarMultiSelect;
