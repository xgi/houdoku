/* eslint-disable react/display-name */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chapter, Series, Languages } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ActionIcon, Center, Group, Text } from '@mantine/core';
import { IconDownload, IconEye, IconFileCheck } from '@tabler/icons';
import routes from '@/common/constants/routes.json';
import { sendProgressToTrackers } from '@/renderer/features/tracker/utils';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { markChapters } from '@/renderer/features/library/utils';
import flags from '@/renderer/img/flags.png';
import {
  chapterDownloadStatusesState,
  chapterListState,
  seriesState,
} from '@/renderer/state/libraryStates';
import {
  chapterLanguagesState,
  trackerAutoUpdateState,
  customDownloadsDirState,
} from '@/renderer/state/settingStates';
import { downloaderClient, DownloadTask } from '@/renderer/services/downloader';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

type Props = {
  series: Series;
  chapter: Chapter;
  handleContextMenu: (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
};

const ChapterTableRow: React.FC<Props> = (props: Props) => {
  const { series, chapter } = props;

  const setSeries = useSetRecoilState(seriesState);
  const setChapterList = useSetRecoilState(chapterListState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const trackerAutoUpdate = useRecoilValue(trackerAutoUpdateState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const chapterDownloadStatuses = useRecoilValue(chapterDownloadStatusesState);

  const handleMarkReadButton = (event: React.MouseEvent) => {
    event.stopPropagation();
    markChapters(
      [chapter],
      props.series,
      !chapter.read,
      setChapterList,
      setSeries,
      chapterLanguages
    );
    if (!chapter.read && trackerAutoUpdate) {
      sendProgressToTrackers(chapter, props.series);
    }
  };

  const handleDownloadButton = (event: React.MouseEvent) => {
    event.stopPropagation();
    downloaderClient.add([
      {
        chapter,
        series,
        downloadsDir: customDownloadsDir || defaultDownloadsDir,
      } as DownloadTask,
    ]);
    downloaderClient.start();
  };

  const navigate = useNavigate();
  const handleTableRowClicked = (rowPath: string) => {
    navigate(rowPath);
  };

  return (
    <tr
      key={chapter.id}
      onContextMenu={props.handleContextMenu}
      onClick={() => handleTableRowClicked(`${routes.READER}/${series.id}/${chapter.id}`)}
    >
      <td>
        <ActionIcon variant="default" onClick={handleMarkReadButton}>
          {chapter.read ? <IconEye size={16} /> : ''}
        </ActionIcon>
      </td>
      <td>
        {Languages[chapter.languageKey] === undefined ? (
          <></>
        ) : (
          <div className="flag-container">
            <img
              src={flags}
              title={Languages[chapter.languageKey].name}
              alt={Languages[chapter.languageKey].name}
              className={`flag flag-${Languages[chapter.languageKey].flagCode}`}
            />
          </div>
        )}
      </td>
      <td>{chapter.title}</td>
      <td>
        <Text lineClamp={1}>{chapter.groupName}</Text>
      </td>
      <td>
        <Center>{chapter.volumeNumber}</Center>
      </td>
      <td>
        <Center>{chapter.chapterNumber}</Center>
      </td>
      <td>
        <Group position="right" spacing="xs" noWrap>
          {chapterDownloadStatuses[chapter.id!] ? (
            <ActionIcon disabled>
              <IconFileCheck size={16} />
            </ActionIcon>
          ) : (
            <ActionIcon variant="default" onClick={handleDownloadButton}>
              <IconDownload size={16} />
            </ActionIcon>
          )}
        </Group>
      </td>
    </tr>
  );
};

export default ChapterTableRow;
