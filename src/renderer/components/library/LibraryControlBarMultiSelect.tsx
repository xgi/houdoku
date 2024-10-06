import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Button, Group, Text } from '@mantine/core';
import { IconChecks, IconTag } from '@tabler/icons';
import { markChapters, reloadSeriesList } from '@/renderer/features/library/utils';
import {
  categoryListState,
  chapterListState,
  multiSelectEnabledState,
  multiSelectSeriesListState,
  reloadingSeriesListState,
  seriesListState,
  seriesState,
  showingLibraryCtxMenuState,
} from '@/renderer/state/libraryStates';
import { chapterLanguagesState } from '@/renderer/state/settingStates';
import library from '@/renderer/services/library';

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
  const setShowingContextMenu = useSetRecoilState(showingLibraryCtxMenuState);
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
    <Group justify="space-between" align="center" pt="sm" mb="md" wrap="nowrap">
      <Group align="left" gap="xs" wrap="nowrap">
        <Button
          onClick={refreshHandler}
          loading={reloadingSeriesList}
          onMouseEnter={() => setShowingContextMenu(false)}
        >
          {reloadingSeriesList ? 'Refreshing...' : 'Refresh selected'}{' '}
        </Button>
        <Button variant="default" leftSection={<IconTag size={14} />}>
          Assign categories
        </Button>
        <Button
          onClick={markAllReadHandler}
          variant="default"
          leftSection={<IconChecks size={14} />}
        >
          Mark all read
        </Button>
      </Group>

      <Group justify="flex-end" align="center" wrap="nowrap">
        <Text>{multiSelectSeriesList.length} series selected</Text>
        <Button variant="default" onClick={() => setMultiSelectEnabled(false)}>
          Exit multi-select
        </Button>
      </Group>
    </Group>
  );
};

export default LibraryControlBarMultiSelect;
