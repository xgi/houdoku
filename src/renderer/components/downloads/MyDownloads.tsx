import React, { useEffect, useState } from 'react';
import { Chapter, Series } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { useRecoilValue } from 'recoil';
import { Accordion, Badge, Group, Stack } from '@mantine/core';
import { IconTrash } from '@tabler/icons';
import { openConfirmModal } from '@mantine/modals';
import ipcChannels from '@/common/constants/ipcChannels.json';
import library from '@/renderer/services/library';
import { customDownloadsDirState } from '@/renderer/state/settingStates';
import { getFromChapterIds } from '@/renderer/features/library/utils';
import DefaultAccordion from '../general/DefaultAccordion';
import DefaultCheckbox from '../general/DefaultCheckbox';
import DefaultText from '../general/DefaultText';
import DefaultButton from '../general/DefaultButton';
import DefaultTitle from '../general/DefaultTitle';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

const MyDownloads: React.FC = () => {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [chapterLists, setChapterLists] = useState<{ [key: string]: Chapter[] }>({});
  const [checkedChapters, setCheckedChapters] = useState<string[]>([]);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);

  const loadDownloads = async () => {
    const downloadedChapterIds = await ipcRenderer.invoke(
      ipcChannels.FILESYSTEM.GET_ALL_DOWNLOADED_CHAPTER_IDS,
      customDownloadsDir || defaultDownloadsDir,
    );
    const downloaded = getFromChapterIds(downloadedChapterIds);

    setSeriesList(downloaded.seriesList);
    setChapterLists(downloaded.chapterLists);
  };

  const deleteChecked = async () => {
    const toDelete = new Set(checkedChapters);
    console.debug(`Deleting ${toDelete.size} downloaded chapters`);

    Promise.all(
      [...toDelete].map(async (chapterId: string) => {
        let seriesId: string | undefined;
        Object.entries(chapterLists).forEach(([curSeriesId, chapters]) => {
          if (chapters.find((chapter) => chapter.id && chapter.id === chapterId)) {
            seriesId = curSeriesId;
          }
        });
        if (!seriesId) return;

        const series = library.fetchSeries(seriesId);
        const chapter = library.fetchChapter(seriesId, chapterId);
        if (series === null || chapter === null) return;

        await ipcRenderer.invoke(
          ipcChannels.FILESYSTEM.DELETE_DOWNLOADED_CHAPTER,
          series,
          chapter,
          customDownloadsDir || defaultDownloadsDir,
        );
      }),
    )
      .then(() => {
        setCheckedChapters([]);
        loadDownloads();
      })
      .catch((err) => console.error(err));
  };

  const promptDeleteChecked = async () => {
    const count = new Set(checkedChapters).size;

    if (count > 1) {
      openConfirmModal({
        title: 'Deleting downloaded chapters',
        children: (
          <DefaultText size="sm">
            Are you sure you want to delete{' '}
            <DefaultText c="teal" component="span" fw={700}>
              {count}
            </DefaultText>{' '}
            downloaded chapters?
          </DefaultText>
        ),
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onConfirm: deleteChecked,
      });
    } else {
      deleteChecked();
    }
  };

  const renderHeader = () => {
    return (
      <Group mb="xs" justify={'space-between'}>
        <DefaultTitle order={3}>My Downloads</DefaultTitle>
        <Group gap="xs">
          <DefaultButton
            size="xs"
            oc="red"
            disabled={checkedChapters.length === 0}
            leftSection={<IconTrash size={16} />}
            onClick={promptDeleteChecked}
          >
            Delete Selected
          </DefaultButton>
          <DefaultButton oc="blue" size="xs" onClick={loadDownloads}>
            Refresh
          </DefaultButton>
        </Group>
      </Group>
    );
  };

  const handleChangeSeriesCheckbox = (seriesId: string | undefined) => {
    if (!seriesId) return;

    const chapterIds: string[] = [];
    chapterLists[seriesId].forEach((chapter) => {
      if (chapter.id) chapterIds.push(chapter.id);
    });

    if (chapterIds.every((id) => checkedChapters.includes(id))) {
      setCheckedChapters(checkedChapters.filter((id) => !chapterIds.includes(id)));
    } else {
      setCheckedChapters([...checkedChapters, ...chapterIds]);
    }
  };

  const handleChangeChapterCheckbox = (chapterId: string | undefined, checked: boolean) => {
    if (!chapterId) return;

    if (checked) {
      if (!checkedChapters.includes(chapterId)) {
        setCheckedChapters([chapterId, ...checkedChapters]);
      }
    } else {
      setCheckedChapters(checkedChapters.filter((id) => id !== chapterId));
    }
  };

  useEffect(() => {
    loadDownloads();
  }, []);

  return (
    <>
      {renderHeader()}
      {seriesList.length === 0 || Object.keys(chapterLists).length === 0 ? (
        <DefaultText>
          You don&apos;t have any downloaded chapters. You can download chapters from the series
          page in your{' '}
          <DefaultText component="span" c="orange" fw={700}>
            Library
          </DefaultText>
          .
        </DefaultText>
      ) : (
        <DefaultAccordion radius="xs" chevronPosition="left" multiple={undefined}>
          {seriesList.map((series) => {
            if (!series.id || !chapterLists[series.id]) return '';

            const numChapters = chapterLists[series.id].length;
            const numSelected = chapterLists[series.id].filter(
              (chapter) => chapter.id && checkedChapters.includes(chapter.id),
            ).length;

            let badgeColor: string | undefined;
            if (numSelected > 0) badgeColor = 'yellow';
            if (numSelected === numChapters) badgeColor = 'teal';

            return (
              <Accordion.Item value={series.id} key={series.id}>
                <Accordion.Control>
                  <Group justify={'space-between'}>
                    <Group>
                      <DefaultCheckbox
                        checked={numSelected === numChapters}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        onChange={() => handleChangeSeriesCheckbox(series.id)}
                      />
                      <DefaultText>{series.title}</DefaultText>
                    </Group>
                    <Badge radius={0} color={badgeColor}>
                      {numSelected}/{numChapters} selected
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap={'xs'}>
                    {chapterLists[series.id]
                      .sort(
                        (a, b) =>
                          parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber) ||
                          a.id!.localeCompare(b.id!),
                      )
                      .reverse()
                      .map((chapter) => {
                        if (!chapter.id) return '';
                        return (
                          <DefaultCheckbox
                            key={chapter.id}
                            ml={40}
                            label={`Chapter ${chapter.chapterNumber} [id:${chapter.id}]`}
                            checked={checkedChapters.includes(chapter.id)}
                            onChange={(e) =>
                              handleChangeChapterCheckbox(chapter.id, e.target.checked)
                            }
                          />
                        );
                      })}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </DefaultAccordion>
      )}
    </>
  );
};

export default MyDownloads;
