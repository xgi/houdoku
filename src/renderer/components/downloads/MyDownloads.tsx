import React, { useEffect, useState } from 'react';
import { Chapter, Series } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { useRecoilValue } from 'recoil';
import { Accordion, Badge, Button, Checkbox, Group, Stack, Text, Title } from '@mantine/core';
import { IconTrash } from '@tabler/icons';
import { openConfirmModal } from '@mantine/modals';
import ipcChannels from '@/common/constants/ipcChannels.json';
import library from '@/renderer/services/library';
import { customDownloadsDirState } from '@/renderer/state/settingStates';
import { getFromChapterIds } from '@/renderer/features/library/utils';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const MyDownloads: React.FC<Props> = () => {
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
      // eslint-disable-next-line promise/always-return
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
          <Text size="sm">
            Are you sure you want to delete{' '}
            <Text c="teal" component="span" fw={700}>
              {count}
            </Text>{' '}
            downloaded chapters?
          </Text>
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
        <Title order={3}>My Downloads</Title>
        <Group gap="xs">
          <Button
            size="xs"
            color="red"
            disabled={checkedChapters.length === 0}
            leftSection={<IconTrash size={16} />}
            onClick={promptDeleteChecked}
          >
            Delete Selected
          </Button>
          <Button size="xs" onClick={loadDownloads}>
            Refresh
          </Button>
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
        <Text>
          You don&apos;t have any downloaded chapters. You can download chapters from the series
          page in your{' '}
          <Text component="span" c="orange" fw={700}>
            Library
          </Text>
          .
        </Text>
      ) : (
        ''
      )}
      <Accordion radius="xs" chevronPosition="left" multiple>
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
                    <Checkbox
                      checked={numSelected === numChapters}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onChange={() => handleChangeSeriesCheckbox(series.id)}
                    />
                    <Text>{series.title}</Text>
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
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        a.id!.localeCompare(b.id!),
                    )
                    .reverse()
                    .map((chapter) => {
                      if (!chapter.id) return '';
                      return (
                        <Checkbox
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
      </Accordion>
    </>
  );
};

export default MyDownloads;
