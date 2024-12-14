import React, { useEffect, useState } from 'react';
import { Chapter, Series } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { useRecoilValue } from 'recoil';
import ipcChannels from '@/common/constants/ipcChannels.json';
import library from '@/renderer/services/library';
import { customDownloadsDirState } from '@/renderer/state/settingStates';
import { getFromChapterIds } from '@/renderer/features/library/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/components/Accordion';
import { Checkbox } from '@/ui/components/Checkbox';
import { Badge } from '@/ui/components/Badge';
import { Label } from '@/ui/components/Label';
import { Button } from '@/ui/components/Button';
import { Trash2Icon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui/components/AlertDialog';

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

  const renderHeader = () => {
    return (
      <div className="flex justify-between pb-2">
        <h2 className="text-xl font-bold">My Downloads</h2>
        <div className="flex space-x-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant={'destructive'} disabled={checkedChapters.length === 0}>
                <Trash2Icon className="h-4 w-4" />
                Delete Selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete downloaded chapters</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {checkedChapters.length} downloaded chapters?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteChecked()}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button size="sm" onClick={loadDownloads}>
            Refresh
          </Button>
        </div>
      </div>
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
        <span>
          You don&apos;t have any downloaded chapters. You can download chapters from the series
          page in your Library.
        </span>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {seriesList.map((series) => {
            if (!series.id || !chapterLists[series.id]) return '';

            const numChapters = chapterLists[series.id].length;
            const numSelected = chapterLists[series.id].filter(
              (chapter) => chapter.id && checkedChapters.includes(chapter.id),
            ).length;

            return (
              <AccordionItem value={series.id} key={series.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex justify-between w-full pr-2">
                    <div className="flex space-x-2">
                      <Checkbox
                        checked={numSelected === numChapters}
                        className="w-5 h-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChangeSeriesCheckbox(series.id);
                        }}
                      />
                      <span>{series.title}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Badge>
                        {numSelected}/{numChapters} selected
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col space-y-2">
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
                          <div
                            className="flex ml-4 space-x-2 items-center"
                            onClick={() =>
                              handleChangeChapterCheckbox(
                                chapter.id,
                                chapter.id === undefined
                                  ? false
                                  : !checkedChapters.includes(chapter.id),
                              )
                            }
                          >
                            <Checkbox
                              key={chapter.id}
                              checked={checkedChapters.includes(chapter.id)}
                            />
                            <Label className="cursor-pointer">
                              Chapter {chapter.chapterNumber} [id:{chapter.id}]
                            </Label>
                          </div>
                        );
                      })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </>
  );
};

export default MyDownloads;
