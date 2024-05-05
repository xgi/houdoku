/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react';
import { Chapter, Series } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Divider, Group, Pagination, Select, Table } from '@mantine/core';
import ChapterTableContextMenu from './ChapterTableContextMenu';
import { getChaptersDownloaded } from '@/common/util/filesystem';
import ipcChannels from '@/common/constants/ipcChannels.json';
import {
  chapterDownloadStatusesState,
  chapterFilterGroupState,
  chapterFilterTitleState,
  chapterListState,
  sortedFilteredChapterListState,
} from '@/renderer/state/libraryStates';
import {
  chapterLanguagesState,
  customDownloadsDirState,
  chapterListPageSizeState,
} from '@/renderer/state/settingStates';
import { currentTaskState } from '@/renderer/state/downloaderStates';
import ChapterTableHeading from './ChapterTableHeading';
import ChapterTableBody from './ChapterTableBody';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

type Props = {
  series: Series;
};

const ChapterTable: React.FC<Props> = (props: Props) => {
  const chapterFilterTitle = useRecoilValue(chapterFilterTitleState);
  const chapterFilterGroup = useRecoilValue(chapterFilterGroupState);
  const [chapterListPageSize, setChapterListPageSize] = useRecoilState(chapterListPageSizeState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const [currentPage, setCurrentPage] = useState(1);
  const [showingContextMenu, setShowingContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const [contextMenuChapter, setContextMenuChapter] = useState<Chapter | undefined>();
  const downloaderCurrentTask = useRecoilValue(currentTaskState);
  const chapterList = useRecoilValue(chapterListState);
  const sortedFilteredChapterList = useRecoilValue(sortedFilteredChapterListState);
  const setChapterDownloadStatuses = useSetRecoilState(chapterDownloadStatusesState);

  const updateDownloadStatuses = () => {
    getChaptersDownloaded(props.series, chapterList, customDownloadsDir || defaultDownloadsDir)
      .then((statuses) => setChapterDownloadStatuses(statuses))
      .catch((err) => console.error(err));
  };

  useEffect(() => setCurrentPage(1), [chapterFilterGroup, chapterFilterTitle, chapterLanguages]);

  useEffect(() => {
    if (downloaderCurrentTask?.page === 2) updateDownloadStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downloaderCurrentTask]);

  useEffect(() => {
    if (chapterList.length > 0) updateDownloadStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterList]);

  return (
    <>
      <ChapterTableContextMenu
        position={contextMenuPosition}
        visible={showingContextMenu}
        series={props.series}
        chapter={contextMenuChapter}
        chapterList={sortedFilteredChapterList}
        close={() => setShowingContextMenu(false)}
      />

      <Table highlightOnHover sx={{ cursor: 'pointer' }}>
        <thead>
          <ChapterTableHeading series={props.series} />
        </thead>
        <tbody>
          <ChapterTableBody
            series={props.series}
            page={currentPage}
            handleContextMenu={(event, chapter) => {
              setContextMenuPosition({ x: event.clientX, y: event.clientY });
              setContextMenuChapter(chapter);
              setShowingContextMenu(true);
            }}
          />
        </tbody>
      </Table>

      <Divider mb="sm" />

      <Group position="right" spacing="md" mb="xl">
        <Pagination
          size="sm"
          page={currentPage}
          onChange={setCurrentPage}
          total={Math.ceil(sortedFilteredChapterList.length / chapterListPageSize)}
        />
        <Select
          size="xs"
          value={`${chapterListPageSize}`}
          data={[10, 20, 50, 100].map((x) => ({ value: `${x}`, label: `${x}/page` }))}
          onChange={(value: string) => setChapterListPageSize(parseInt(value, 10))}
          style={{ width: 90 }}
        />
      </Group>
    </>
  );
};

export default ChapterTable;
