import React from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Group } from '@mantine/core';
import { IconChecks } from '@tabler/icons';
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
import DefaultButton from '../general/DefaultButton';
import DefaultText from '../general/DefaultText';

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
    <Group justify="space-between" align="center" pt="sm" mb="md" wrap="nowrap">
      <Group align="left" gap="xs" wrap="nowrap">
        <DefaultButton oc="blue" onClick={refreshHandler} loading={reloadingSeriesList}>
          {reloadingSeriesList ? 'Refreshing...' : 'Refresh selected'}{' '}
        </DefaultButton>
        {/* <Button variant="default" leftSection={<IconTag size={14} />}>
          Assign categories
        </Button> */}
        <DefaultButton
          onClick={markAllReadHandler}
          variant="default"
          leftSection={<IconChecks size={14} />}
        >
          Mark all read
        </DefaultButton>
      </Group>

      <Group justify="flex-end" align="center" wrap="nowrap">
        <DefaultText>{multiSelectSeriesList.length} series selected</DefaultText>
        <DefaultButton variant="default" onClick={() => setMultiSelectEnabled(false)}>
          Exit multi-select
        </DefaultButton>
      </Group>
    </Group>
  );
};

export default LibraryControlBarMultiSelect;
