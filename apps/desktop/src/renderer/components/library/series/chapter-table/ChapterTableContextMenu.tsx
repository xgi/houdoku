import React from 'react';
import { Chapter, Series } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { downloaderClient, DownloadTask } from '@/renderer/services/downloader';
import { markChapters } from '@/renderer/features/library/utils';
import routes from '@/common/constants/routes.json';
import ipcChannels from '@/common/constants/ipcChannels.json';
import {
  chapterListState,
  seriesState,
  sortedFilteredChapterListState,
} from '@/renderer/state/libraryStates';
import { chapterLanguagesState, customDownloadsDirState } from '@/renderer/state/settingStates';
import { ContextMenuContent, ContextMenuItem } from '@houdoku/ui/components/ContextMenu';
import { Download, Eye, EyeOff, Play, Pointer } from 'lucide-react';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

type Props = {
  series: Series;
  chapter: Chapter;
  selectFunc: (chapters: Chapter[]) => void;
};

export const ChapterTableContextMenu: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const setChapterList = useSetRecoilState(chapterListState);
  const setSeries = useSetRecoilState(seriesState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const sortedFilteredChapterList = useRecoilValue(sortedFilteredChapterListState);

  const handleRead = () => {
    navigate(`${routes.READER}/${props.series.id}/${props.chapter.id}`);
  };

  const handleMarkRead = (read: boolean) => {
    markChapters([props.chapter], props.series, read, setChapterList, setSeries, chapterLanguages);
  };

  const handleSelectPrevious = () => {
    const previousChapters = sortedFilteredChapterList.filter(
      (chapter: Chapter) =>
        props.chapter !== undefined &&
        parseFloat(chapter.chapterNumber) < parseFloat(props.chapter.chapterNumber),
    );
    props.selectFunc(previousChapters);
  };

  const handleDownload = () => {
    downloaderClient.add([
      {
        chapter: props.chapter,
        series: props.series,
        downloadsDir: customDownloadsDir || defaultDownloadsDir,
      } as DownloadTask,
    ]);
    downloaderClient.start();
  };

  return (
    <ContextMenuContent className="w-48">
      <ContextMenuItem onClick={handleRead}>
        <Play className="h-4 w-4 mr-2" />
        Read chapter
      </ContextMenuItem>
      {props.chapter.read ? (
        <ContextMenuItem onClick={() => handleMarkRead(false)}>
          <EyeOff className="h-4 w-4 mr-2" />
          Mark unread
        </ContextMenuItem>
      ) : (
        <ContextMenuItem onClick={() => handleMarkRead(true)}>
          <Eye className="h-4 w-4 mr-2" />
          Mark read
        </ContextMenuItem>
      )}
      <ContextMenuItem onClick={handleSelectPrevious}>
        <Pointer className="h-4 w-4 mr-2" />
        Select previous
      </ContextMenuItem>
      <ContextMenuItem onClick={handleDownload}>
        <Download className="h-4 w-4 mr-2" />
        Download
      </ContextMenuItem>
    </ContextMenuContent>
  );
};
