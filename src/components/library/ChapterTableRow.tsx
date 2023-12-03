/* eslint-disable react/display-name */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chapter, Series, Languages } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ActionIcon, Button, Center, Group, Text } from '@mantine/core';
import { IconDownload, IconEye, IconFileCheck } from '@tabler/icons';
import routes from '../../constants/routes.json';
import { sendProgressToTrackers } from '../../features/tracker/utils';
import ipcChannels from '../../constants/ipcChannels.json';
import { markChapters } from '../../features/library/utils';
import flags from '../../img/flags.png';
import {
  chapterDownloadStatusesState,
  chapterListState,
  seriesState,
} from '../../state/libraryStates';
import {
  chapterLanguagesState,
  trackerAutoUpdateState,
  customDownloadsDirState,
} from '../../state/settingStates';
import { downloaderClient, DownloadTask } from '../../services/downloader';

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

  const handleDownload = () => {
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
    console.log(rowPath);
    navigate(rowPath);
  };

  return (
    <tr
      key={chapter.id}
      onContextMenu={props.handleContextMenu}
      onClick={() => handleTableRowClicked(`${routes.READER}/${series.id}/${chapter.id}`)}
    >
      <td>
        <ActionIcon
          variant="default"
          onClick={() => {
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
          }}
        >
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
          {/* <Link to={`${routes.READER}/${series.id}/${chapter.id}`}>
            <Button variant="default" size="xs">
              Read Me
            </Button>
          </Link> */}

          {chapterDownloadStatuses[chapter.id!] ? (
            <ActionIcon disabled>
              <IconFileCheck size={16} />
            </ActionIcon>
          ) : (
            <ActionIcon variant="default" onClick={handleDownload}>
              <IconDownload size={16} />
            </ActionIcon>
          )}
        </Group>
      </td>
    </tr>
  );
};

export default ChapterTableRow;
